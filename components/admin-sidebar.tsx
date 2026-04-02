'use client'

import { useEffect, useState } from "react"
import { getExpenseStats } from "@/actions/expense"
import { TrendingUp, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function AdminSidebar() {
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
    return null
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
  )
}