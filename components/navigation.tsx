"use client"

import Link from "next/link"
import { useState, Fragment } from "react"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, LogOut, Users, Receipt, Menu, X, Wallet, FileText } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { createFund } from "@/actions/expense"

interface NavProps {
  user: {
    name: string | null
    email: string
    role: "ADMIN" | "MEMBER"
  }
}

export function Navigation({ user }: NavProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showFundModal, setShowFundModal] = useState(false)
  const [fundLoading, setFundLoading] = useState(false)
  const [fundSuccess, setFundSuccess] = useState(false)
  const [fundError, setFundError] = useState("")
  const [formData, setFormData] = useState({
    amount: "",
    receivedFrom: "",
    paymentMode: "CASH" as "CASH" | "GPAY" | "BANK_ACCOUNT",
    upiId: "",
    accountNumber: "",
    fundDate: new Date().toISOString().split("T")[0],
  })
  const isAdmin = user.role === "ADMIN"

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      href: "/dashboard/expense-entry",
      label: "Expense Entry",
      icon: Receipt,
      visible: !isAdmin,
    },
    {
      href: "/dashboard/my-statement",
      label: "My Statement",
      icon: FileText,
      visible: !isAdmin,
    },
    {
      href: "/admin",
      label: "Admin",
      icon: LayoutDashboard,
      visible: isAdmin,
    },
    {
      href: "/admin/members",
      label: "Members",
      icon: Users,
      visible: isAdmin,
    },
    {
      href: "/admin/my-statement",
      label: "My Statement",
      icon: FileText,
      visible: isAdmin,
    },
  ]

  async function handleFundSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFundLoading(true)
    setFundError("")

    const result = await createFund({
      amount: parseFloat(formData.amount),
      receivedFrom: formData.receivedFrom,
      paymentMode: formData.paymentMode,
      upiId: formData.paymentMode === "GPAY" ? formData.upiId : undefined,
      accountNumber: formData.paymentMode === "BANK_ACCOUNT" ? formData.accountNumber : undefined,
      fundDate: formData.fundDate,
    })

    if (result.error) {
      setFundError(result.error)
      setFundLoading(false)
      return
    }

    setFundSuccess(true)
    setFundLoading(false)
    setTimeout(() => {
      setShowFundModal(false)
      setFundSuccess(false)
      setFormData({
        amount: "",
        receivedFrom: "",
        paymentMode: "CASH",
        upiId: "",
        accountNumber: "",
        fundDate: new Date().toISOString().split("T")[0],
      })
    }, 1500)
  }

  return (
    <Fragment>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3 md:gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Receipt className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-base sm:text-xl text-gray-900">Expense Manager</span>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                {navItems.filter(item => item.visible).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "text-red-600"
                        : "text-gray-600 hover:text-red-600"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                {!isAdmin && (
                  <button
                    onClick={() => setShowFundModal(true)}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      showFundModal ? "text-red-600" : "text-gray-600 hover:text-red-600"
                    )}
                  >
                    My Fund
                  </button>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                <span className="text-xs text-gray-500">{user.role}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              {!isAdmin && (
                <Button
                  onClick={() => setShowFundModal(true)}
                  size="sm"
                  variant="ghost"
                >
                  <Wallet className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="flex flex-col gap-2">
                {navItems.filter(item => item.visible).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "text-red-600"
                        : "text-gray-600"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </nav>

      {showFundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Deposit Fund</h2>
              <button onClick={() => setShowFundModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                ✕
              </button>
            </div>

            {fundSuccess ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-600 font-medium">Fund deposited successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleFundSubmit} className="space-y-4">
                {fundError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
                    {fundError}
                  </div>
                )}

                <div>
                  <Label htmlFor="nav-amount">Amount *</Label>
                  <Input
                    id="nav-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Enter amount"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="nav-fundDate">Date *</Label>
                  <Input
                    id="nav-fundDate"
                    type="date"
                    value={formData.fundDate}
                    onChange={(e) => setFormData({ ...formData, fundDate: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="nav-receivedFrom">Received From *</Label>
                  <Input
                    id="nav-receivedFrom"
                    value={formData.receivedFrom}
                    onChange={(e) => setFormData({ ...formData, receivedFrom: e.target.value })}
                    placeholder="Enter sender name"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="nav-paymentMode">Payment Mode *</Label>
                  <Select
                    id="nav-paymentMode"
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as "CASH" | "GPAY" | "BANK_ACCOUNT" })}
                    className="mt-1"
                  >
                    <option value="CASH">Cash</option>
                    <option value="GPAY">GPay</option>
                    <option value="BANK_ACCOUNT">Bank Account</option>
                  </Select>
                </div>

                {formData.paymentMode === "GPAY" && (
                  <div>
                    <Label htmlFor="nav-upiId">UPI ID *</Label>
                    <Input
                      id="nav-upiId"
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      placeholder="Enter UPI ID (e.g., mobile@upi)"
                      required
                      className="mt-1"
                    />
                  </div>
                )}

                {formData.paymentMode === "BANK_ACCOUNT" && (
                  <div>
                    <Label htmlFor="nav-accountNumber">Account Number *</Label>
                    <Input
                      id="nav-accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="Enter account number"
                      required
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={fundLoading} className="flex-1">
                    {fundLoading ? "Submitting..." : "Submit"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowFundModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Fragment>
  )
}