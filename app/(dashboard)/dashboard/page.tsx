import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getMyExpenses } from "@/actions/expense"
import { MemberExpenseList } from "@/components/member-expense-list"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin")
  }

  const expenses = await getMyExpenses()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
        <p className="text-gray-600 mt-1">Track and manage your submitted expenses</p>
      </div>

      <div className="mt-6 sm:mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
        </div>
        <MemberExpenseList
          expenses={expenses}
          budget={0}
          totalAmountUsed={0}
        />
      </div>
    </div>
  )
}
