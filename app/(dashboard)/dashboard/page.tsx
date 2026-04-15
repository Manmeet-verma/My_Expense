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
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">My Expenses</h1>
      </div>

      {stats && <StatsCards mode="member" stats={stats} />}
    </div>
  )
}
