import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getExpenseStats } from "@/actions/expense"
import { StatsCards } from "@/components/stats-cards"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN" || session.user.role === "SUPERVISOR") {
    redirect("/admin")
  }

  const stats = await getExpenseStats()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
      </div>

      {stats && <StatsCards mode="member" stats={stats} />}
    </div>
  )
}
