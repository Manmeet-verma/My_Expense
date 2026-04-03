'use client'

import { useEffect, useState } from "react"
import { getExpenseStats } from "@/actions/expense"
import { TrendingUp, Clock, CheckCircle, XCircle, DollarSign, ChevronDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [stats, setStats] = useState<{
    total: number
    submittedAmount: number
    totalBudget: number
    pending: number
    approved: number
    rejected: number
    paid: number
    totalApprovedAmount: number
    totalPaidAmount: number
  } | null>(null)

  useEffect(() => {
    getExpenseStats().then(setStats)
  }, [])

  if (!stats) {
    return (
      <>
        <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-blue-600 text-white rounded-lg"
          >
            <span className="font-medium">{isOpen ? "Close Admin Sidebar" : "Open Admin Sidebar"}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded p-2 animate-pulse">
                  <div className="h-3 w-16 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="bg-white border-r border-gray-200 hidden md:block sticky top-16">
          <div className="flex flex-col gap-2 p-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded p-2 animate-pulse">
                <div className="h-3 w-16 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </aside>
      </>
    )
  }

  const cards = [
    { title: "Total Expense", value: formatCurrency(stats.submittedAmount), icon: TrendingUp, color: "text-blue-600" },
    { title: "Approved Expense", value: formatCurrency(stats.totalApprovedAmount), icon: CheckCircle, color: "text-green-600" },
    { title: "Mark Paid Expense", value: formatCurrency(stats.totalPaidAmount ?? 0), icon: DollarSign, color: "text-teal-600" },
    { title: "Approved Count", value: stats.approved, icon: CheckCircle, color: "text-green-600" },
    { title: "Paid Count", value: stats.paid, icon: DollarSign, color: "text-teal-600" },
    { title: "Rejected Count", value: stats.rejected, icon: XCircle, color: "text-red-600" },
    { title: "Pending Count", value: stats.pending, icon: Clock, color: "text-yellow-600" },
  ]

  return (
    <>
      <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-blue-600 text-white rounded-lg"
        >
          <span className="font-medium">{isOpen ? "Close Admin Sidebar" : "Open Admin Sidebar"}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {cards.map((card) => (
              <div key={card.title} className="bg-gray-50 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <card.icon className={`h-3 w-3 ${card.color}`} />
                  <span className="text-xs text-gray-500">{card.title}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="bg-white border-r border-gray-200 hidden md:block sticky top-16">
        <div className="flex flex-col gap-2 p-2">
          {cards.map((card) => (
            <div key={card.title} className="bg-gray-50 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <card.icon className={`h-3 w-3 ${card.color}`} />
                <span className="text-xs text-gray-500">{card.title}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}