'use client'

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { approveOrRejectExpense, markExpensePaid } from "@/actions/expense"
import { broadcastExpenseChange } from "@/lib/supabase/realtime"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ExportExcelButton } from "@/components/export-excel-button"
import { formatCurrency } from "@/lib/utils"

type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID"
type ApproverRole = "ADMIN" | "SUPERVISOR" | "MEMBER"
type VerifyStatus = "VERIFIED" | "REJECTED" | "PENDING"
type ApprovalStatus = "APPROVED" | "PENDING"
type DashboardFilter = "all" | "pending" | "approved" | "paid" | "rejected"
type DisplayStatus = "Pending" | "Payable" | "Rejected" | "Paid"

interface ExpenseRow {
  id: string
  site: string
  category: string
  mainHead: string
  description: string
  createdAt: Date | null
  amount: number
  expenseStatus: ExpenseStatus
  approvedByName: string | null
  approvedByEmail: string | null
  approvedByRole: ApproverRole | null
  verifyStatus: VerifyStatus
  approvalStatus: ApprovalStatus
  isDraft: boolean
}

interface AdminExpenseManagementTableProps {
  totalReceivedAmount: number
  expenses: Array<{
    id: string
    title: string
    description: string | null
    createdAt: Date
    amount: number
    category: string
    status: ExpenseStatus
    createdBy?: {
      name: string | null
      email: string
    } | null
    approvedBy?: {
      name: string | null
      email: string
      role: ApproverRole
    } | null
  }>
}

const PAGE_SIZE = 10

function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getVerifyStatus(status: ExpenseStatus): VerifyStatus {
  if (status === "REJECTED") return "REJECTED"
  if (status === "APPROVED" || status === "PAID") return "VERIFIED"
  return "PENDING"
}

function getApprovalStatus(status: ExpenseStatus): ApprovalStatus {
  if (status === "APPROVED" || status === "PAID") return "APPROVED"
  return "PENDING"
}

function getDisplayStatus(status: ExpenseStatus): DisplayStatus {
  if (status === "APPROVED") return "Payable"
  if (status === "PAID") return "Paid"
  if (status === "REJECTED") return "Rejected"
  return "Pending"
}

function getRoleLabel(role: ApproverRole): string {
  if (role === "SUPERVISOR") return "Verifier"
  if (role === "ADMIN") return "Admin"
  return "Member"
}

function getApprovedBy(
  status: ExpenseStatus,
  approvedByName: string | null,
  approvedByEmail: string | null,
  approvedByRole: ApproverRole | null
): string {
  if (status === "PENDING") return "Pending"

  if (approvedByRole) {
    const roleLabel = getRoleLabel(approvedByRole)
    const actor = approvedByName || approvedByEmail || roleLabel
    return `${actor} (${roleLabel})`
  }

  if (status === "PAID") return "Admin (Admin)"
  return "Verifier (Verifier)"
}

export function AdminExpenseManagementTable({ totalReceivedAmount, expenses }: AdminExpenseManagementTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [dashboardFilter, setDashboardFilter] = useState<DashboardFilter>("all")
  const [draftEntries, setDraftEntries] = useState<ExpenseRow[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)

  const serverRows = useMemo<ExpenseRow[]>(
    () =>
      expenses.map((expense) => ({
        id: expense.id,
        site: expense.createdBy?.name || expense.createdBy?.email || "Unknown",
        category: formatCategory(expense.category),
        mainHead: expense.title || "-",
        description: expense.description || "-",
        createdAt: expense.createdAt,
        amount: expense.amount,
        expenseStatus: expense.status,
        approvedByName: expense.approvedBy?.name || null,
        approvedByEmail: expense.approvedBy?.email || null,
        approvedByRole: expense.approvedBy?.role || null,
        verifyStatus: getVerifyStatus(expense.status),
        approvalStatus: getApprovalStatus(expense.status),
        isDraft: false,
      })),
    [expenses]
  )

  const amounts = useMemo(() => {
    const pending = serverRows
      .filter((row) => row.expenseStatus === "PENDING")
      .reduce((sum, row) => sum + row.amount, 0)
    const approved = serverRows
      .filter((row) => row.expenseStatus === "APPROVED")
      .reduce((sum, row) => sum + row.amount, 0)
    const paid = serverRows
      .filter((row) => row.expenseStatus === "PAID")
      .reduce((sum, row) => sum + row.amount, 0)
    const rejected = serverRows
      .filter((row) => row.expenseStatus === "REJECTED")
      .reduce((sum, row) => sum + row.amount, 0)

    return { pending, approved, paid, rejected }
  }, [serverRows])

  const allRows = useMemo(() => [...draftEntries, ...serverRows], [draftEntries, serverRows])

  const dashboardFilteredRows = useMemo(() => {
    if (dashboardFilter === "all") return allRows
    return allRows.filter((row) => row.expenseStatus === dashboardFilter.toUpperCase())
  }, [allRows, dashboardFilter])

  const dateFilteredRows = useMemo(() => {
    return dashboardFilteredRows.filter((row) => {
      if (row.isDraft || !row.createdAt) return true

      const rowDate = new Date(row.createdAt)
      const startOk = !fromDate || rowDate >= new Date(`${fromDate}T00:00:00`)
      const endOk = !toDate || rowDate <= new Date(`${toDate}T23:59:59`)
      return startOk && endOk
    })
  }, [dashboardFilteredRows, fromDate, toDate])

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return dateFilteredRows
    const lowered = searchTerm.trim().toLowerCase()
    return dateFilteredRows.filter((row) => row.mainHead.toLowerCase().includes(lowered))
  }, [dateFilteredRows, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredRows.slice(start, start + PAGE_SIZE)
  }, [filteredRows, currentPage])

  const exportData = useMemo(
    () =>
      filteredRows
        .filter((row) => !row.isDraft)
        .map((row, index) => ({
          "Sr No": index + 1,
          Site: row.site,
          Category: row.category,
          "Main Head": row.mainHead,
          Description: row.description,
          Amount: row.amount,
          Status: getDisplayStatus(row.expenseStatus),
          "Approved By": getApprovedBy(
            row.expenseStatus,
            row.approvedByName,
            row.approvedByEmail,
            row.approvedByRole
          ),
          Approval: row.approvalStatus,
          Action:
            row.expenseStatus === "PENDING"
              ? "Approve/Reject"
              : row.expenseStatus === "APPROVED"
                ? "Pay"
                : row.expenseStatus === "PAID"
                  ? "Paid"
                  : "Rejected",
        })),
    [filteredRows]
  )

  function addDraftEntry() {
    const id = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const nextEntry: ExpenseRow = {
      id,
      site: "",
      category: "",
      mainHead: "",
      description: "",
      createdAt: null,
      amount: 0,
      expenseStatus: "PENDING",
      approvedByName: null,
      approvedByEmail: null,
      approvedByRole: null,
      verifyStatus: "PENDING",
      approvalStatus: "PENDING",
      isDraft: true,
    }

    setDraftEntries((prev) => [nextEntry, ...prev])
    setCurrentPage(1)
  }

  function updateDraftEntry(id: string, field: keyof ExpenseRow, value: string | number) {
    setDraftEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    )
  }

  function removeDraftEntry(id: string) {
    setDraftEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  function changePage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) return
    setCurrentPage(nextPage)
  }

  async function handleApprove(id: string) {
    if (processingId) return
    setProcessingId(id)
    const result = await approveOrRejectExpense({ id, status: "APPROVED" })
    if (result?.error) {
      alert(result.error)
      setProcessingId(null)
      return
    }
    void broadcastExpenseChange("admin-approve")
    router.refresh()
    setProcessingId(null)
  }

  async function handleReject(id: string) {
    if (processingId) return
    setProcessingId(id)
    const result = await approveOrRejectExpense({ id, status: "REJECTED" })
    if (result?.error) {
      alert(result.error)
      setProcessingId(null)
      return
    }
    void broadcastExpenseChange("admin-reject")
    router.refresh()
    setProcessingId(null)
  }

  async function handleMarkPaid(id: string) {
    if (processingId) return
    setProcessingId(id)
    const result = await markExpensePaid({ id })
    if (result?.error) {
      alert(result.error)
      setProcessingId(null)
      return
    }
    void broadcastExpenseChange("admin-paid")
    router.refresh()
    setProcessingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          onClick={() => {
            setDashboardFilter("all")
            setCurrentPage(1)
          }}
          className={`rounded-lg border p-4 text-left transition ${dashboardFilter === "all" ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"}`}
        >
          <p className="text-xs text-gray-600">Total Received Amount</p>
          <p className="mt-1 text-xl font-bold text-blue-700">{formatCurrency(totalReceivedAmount)}</p>
        </button>

        <button
          onClick={() => {
            setDashboardFilter("rejected")
            setCurrentPage(1)
          }}
          className={`rounded-lg border p-4 text-left transition ${dashboardFilter === "rejected" ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
        >
          <p className="text-xs text-gray-600">Total Unapproved Exp. - Req.</p>
          <p className="mt-1 text-xl font-bold text-red-700">{formatCurrency(amounts.rejected)}</p>
        </button>

        <button
          onClick={() => {
            setDashboardFilter("approved")
            setCurrentPage(1)
          }}
          className={`rounded-lg border p-4 text-left transition ${dashboardFilter === "approved" ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-white"}`}
        >
          <p className="text-xs text-gray-600">Total Approved Exp. - Payable</p>
          <p className="mt-1 text-xl font-bold text-yellow-700">{formatCurrency(amounts.approved)}</p>
        </button>

        <button
          onClick={() => {
            setDashboardFilter("paid")
            setCurrentPage(1)
          }}
          className={`rounded-lg border p-4 text-left transition ${dashboardFilter === "paid" ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"}`}
        >
          <p className="text-xs text-gray-600">Total Approved Exp. - Paid</p>
          <p className="mt-1 text-xl font-bold text-green-700">{formatCurrency(amounts.paid)}</p>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setDashboardFilter("pending")
            setCurrentPage(1)
          }}
          className={`rounded border px-3 py-1.5 text-sm ${dashboardFilter === "pending" ? "border-red-300 bg-red-50 text-red-700" : "border-gray-200 bg-white text-gray-700"}`}
        >
          Pending Head: {formatCurrency(amounts.pending)}
        </button>
        <button
          onClick={() => {
            setDashboardFilter("rejected")
            setCurrentPage(1)
          }}
          className={`rounded border px-3 py-1.5 text-sm ${dashboardFilter === "rejected" ? "border-red-300 bg-red-50 text-red-700" : "border-gray-200 bg-white text-gray-700"}`}
        >
          Rejected Head: {formatCurrency(amounts.rejected)}
        </button>
        <button
          onClick={() => {
            setDashboardFilter("paid")
            setCurrentPage(1)
          }}
          className={`rounded border px-3 py-1.5 text-sm ${dashboardFilter === "paid" ? "border-green-300 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-700"}`}
        >
          Paid Head: {formatCurrency(amounts.paid)}
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:max-w-2xl sm:flex-row sm:items-center">
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by Expense Head Request"
            className="w-full sm:max-w-sm"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">From</span>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full sm:w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">To</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full sm:w-40"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportExcelButton
            data={exportData}
            fileName="admin-expense-management"
            sheetName="Expenses"
            label="Export Excel"
          />
          <Button onClick={addDraftEntry}>Add Entry</Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full w-full text-xs sm:text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Sr No</th>
              <th className="px-4 py-3 font-semibold">Site</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Main Head</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Verified/Rejected/Pending</th>
              <th className="px-4 py-3 font-semibold">Approved By</th>
              <th className="px-4 py-3 font-semibold">Approved/Pending</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                  No entries found
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, index) => (
                <tr key={row.id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 text-gray-700">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.isDraft ? (
                      <Input
                        value={row.site}
                        onChange={(e) => updateDraftEntry(row.id, "site", e.target.value)}
                        placeholder="Site"
                        className="h-8 min-w-[120px]"
                      />
                    ) : (
                      row.site
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.isDraft ? (
                      <Input
                        value={row.category}
                        onChange={(e) => updateDraftEntry(row.id, "category", e.target.value)}
                        placeholder="Category"
                        className="h-8 min-w-[120px]"
                      />
                    ) : (
                      row.category
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.isDraft ? (
                      <Input
                        value={row.mainHead}
                        onChange={(e) => updateDraftEntry(row.id, "mainHead", e.target.value)}
                        placeholder="Expense Head Request"
                        className="h-8 min-w-[180px]"
                      />
                    ) : (
                      row.mainHead
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.isDraft ? (
                      <Input
                        value={row.description}
                        onChange={(e) => updateDraftEntry(row.id, "description", e.target.value)}
                        placeholder="Description"
                        className="h-8 min-w-[180px]"
                      />
                    ) : (
                      row.description
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {row.isDraft ? (
                      <Input
                        type="number"
                        value={row.amount || ""}
                        onChange={(e) => updateDraftEntry(row.id, "amount", Number(e.target.value) || 0)}
                        placeholder="0"
                        className="h-8 min-w-[120px]"
                      />
                    ) : (
                      formatCurrency(row.amount)
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.isDraft ? (
                      <select
                        value={row.verifyStatus}
                        onChange={(e) => updateDraftEntry(row.id, "verifyStatus", e.target.value as VerifyStatus)}
                        className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs sm:text-sm"
                      >
                        <option value="VERIFIED">Verified</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    ) : (
                      getDisplayStatus(row.expenseStatus)
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.isDraft
                      ? "-"
                      : getApprovedBy(
                          row.expenseStatus,
                          row.approvedByName,
                          row.approvedByEmail,
                          row.approvedByRole
                        )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.isDraft ? (
                      <select
                        value={row.approvalStatus}
                        onChange={(e) => updateDraftEntry(row.id, "approvalStatus", e.target.value as ApprovalStatus)}
                        className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs sm:text-sm"
                      >
                        <option value="APPROVED">Approved</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    ) : (
                      row.approvalStatus
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.isDraft ? (
                      <Button variant="outline" size="sm" onClick={() => removeDraftEntry(row.id)}>
                        Remove
                      </Button>
                    ) : row.expenseStatus === "PENDING" ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => void handleApprove(row.id)}
                          disabled={processingId === row.id}
                        >
                          {processingId === row.id ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void handleReject(row.id)}
                          disabled={processingId === row.id}
                        >
                          {processingId === row.id ? "Rejecting..." : "Reject"}
                        </Button>
                      </div>
                    ) : row.expenseStatus === "APPROVED" ? (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => void handleMarkPaid(row.id)}
                        disabled={processingId === row.id}
                      >
                        {processingId === row.id ? "Updating..." : "Pay"}
                      </Button>
                    ) : row.expenseStatus === "PAID" ? (
                      <span className="text-sm font-medium text-green-700">Paid</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-600 sm:text-sm">
          Showing {paginatedRows.length} of {filteredRows.length} entries
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <span className="text-xs text-gray-700 sm:text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
