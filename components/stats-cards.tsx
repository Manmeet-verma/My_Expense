"use client"

import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react"

interface StatsCardsProps {
  stats: {
    total: number
    pending: number
    approved: number
    rejected: number
    paid?: number
    totalApprovedAmount: number
    totalPaidAmount?: number
    totalBudget?: number
    submittedAmount?: number
    remainingBudget?: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const totalExpenseAmount = stats.submittedAmount ?? 0
  const submittedExpenseAmount = stats.totalPaidAmount ?? 0
  const remainingExpenseAmount = submittedExpenseAmount - totalExpenseAmount

  const cards = [
    {
      title: "Total Expense",
      value: formatCurrency(totalExpenseAmount),
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Submitted Expense",
      value: formatCurrency(submittedExpenseAmount),
      icon: DollarSign,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Remaining",
      value: formatCurrency(remainingExpenseAmount),
      icon: DollarSign,
      color: remainingExpenseAmount >= 0 ? "text-green-600" : "text-red-600",
      bgColor: remainingExpenseAmount >= 0 ? "bg-green-50" : "bg-red-50",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Paid",
      value: stats.paid ?? 0,
      icon: CheckCircle,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
