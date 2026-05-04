import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getExpenseStats, getMyExpenses, getMyFunds } from "@/actions/expense"
import DashboardMemberView from "@/components/dashboard-member-view"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN" || session.user.role === "SUPERVISOR") {
    redirect("/admin")
  }

  const stats = await getExpenseStats()
  const expenses = await getMyExpenses()
  const funds = await getMyFunds()
  const siteName = session.user.name || session.user.email

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">My Expenses</h1>
      </div>

      <DashboardMemberView stats={stats} expenses={expenses} funds={funds} site={siteName} />
    </div>
  )
}
