import { auth } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAllExpenses, getExpenseStats } from "@/actions/expense"
import { AdminExpenseManagementTable } from "@/components/admin-expense-management-table"
import { buttonVariants } from "@/components/ui/button"
import { KeyRound } from "lucide-react"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERVISOR") {
    redirect("/dashboard")
  }

  const expenses = await getAllExpenses()
  const stats = await getExpenseStats()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Expense Review</h1>
        <p className="mt-1 text-gray-600">Admin and supervisor can approve, reject, pay, and view the same expense workflow here.</p>
      </div>

      <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold text-gray-900">Member Accounts</h2>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Link href="/admin/reset-password" className={buttonVariants({ variant: "outline" })}>
            <span className="inline-flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Reset Member Password
            </span>
          </Link>
          <Link href="/signup" className={buttonVariants()}>
            Create Member Account
          </Link>
        </div>
      </div>

      <AdminExpenseManagementTable
        expenses={expenses}
        totalReceivedAmount={session.user.role === "ADMIN" ? stats?.collectionAmount ?? 0 : 0}
      />
    </div>
  )
}
