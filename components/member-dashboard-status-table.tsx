"use client"

import { useMemo, useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID"
type DisplayStatus = "PENDING" | "APPROVED" | "REJECTED" | "VERIFIED" | "ALL"

interface MemberDashboardExpense {
  id: string
  title: string
  category: string
  status: ExpenseStatus
}

interface MemberDashboardStatusTableProps {
  site: string
  expenses: MemberDashboardExpense[]
}

function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getDisplayStatus(status: ExpenseStatus): Exclude<DisplayStatus, "ALL"> {
  if (status === "PAID") return "VERIFIED"
  return status
}

function getStatusBadgeVariant(status: Exclude<DisplayStatus, "ALL">): "warning" | "success" | "destructive" | "secondary" {
  if (status === "PENDING") return "warning"
  if (status === "APPROVED") return "success"
  if (status === "REJECTED") return "destructive"
  return "secondary"
}

function actionTakenBy(status: Exclude<DisplayStatus, "ALL">): string {
  if (status === "PENDING") return "Pending Review"
  if (status === "APPROVED") return "Verifier"
  if (status === "REJECTED") return "Verifier"
  return "Admin"
}

function inputterAction(status: Exclude<DisplayStatus, "ALL">): string {
  if (status === "PENDING") return "Submitted (can edit/delete)"
  return "Submitted"
}

interface MemberDashboardStatusTablePropsExtended extends MemberDashboardStatusTableProps {
  activeStatus?: DisplayStatus
  onStatusChange?: (s: DisplayStatus) => void
}

export function MemberDashboardStatusTable({ site, expenses, activeStatus: externalActiveStatus, onStatusChange }: MemberDashboardStatusTablePropsExtended) {
  const [activeStatus, setActiveStatus] = useState<DisplayStatus>(externalActiveStatus ?? "ALL")

  // Sync with external control if provided
  useEffect(() => {
    if (externalActiveStatus !== undefined && externalActiveStatus !== activeStatus) {
      setActiveStatus(externalActiveStatus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalActiveStatus])

  const rows = useMemo(
    () =>
      expenses.map((expense) => ({
        id: expense.id,
        site,
        expenseHead: formatCategory(expense.category),
        mainHead: expense.title || "-",
        status: getDisplayStatus(expense.status),
      })),
    [expenses, site]
  )

  const filteredRows = useMemo(() => {
    if (activeStatus === "ALL") return rows
    return rows.filter((row) => row.status === activeStatus)
  }, [rows, activeStatus])

  const statusButtons: DisplayStatus[] = ["ALL", "PENDING", "REJECTED", "VERIFIED", "APPROVED"]

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Expense Checking Status (Site Wise)</h2>
        <div className="flex flex-wrap gap-2">
          {statusButtons.map((status) => (
            <button
              key={status}
              onClick={() => {
                setActiveStatus(status)
                onStatusChange?.(status)
              }}
              className={`rounded border px-3 py-1.5 text-xs sm:text-sm ${
                activeStatus === status
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-xs sm:text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Sr</th>
              <th className="px-4 py-3 font-semibold">Site</th>
              <th className="px-4 py-3 font-semibold">Expenses Head</th>
              <th className="px-4 py-3 font-semibold">Main Head</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action taken by</th>
              <th className="px-4 py-3 font-semibold">Action of Inputter</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  No expenses found for selected status
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr key={row.id} className="border-t border-gray-100 odd:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-700">{row.site}</td>
                  <td className="px-4 py-3 text-gray-700">{row.expenseHead}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{row.mainHead}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariant(row.status)}>{row.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{actionTakenBy(row.status)}</td>
                  <td className="px-4 py-3 text-gray-700">{inputterAction(row.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
