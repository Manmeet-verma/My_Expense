import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAdmins } from "@/actions/auth"
import { getAllExpenses, getExpenseStats } from "@/actions/expense"
import { AdminSection } from "@/components/forms/admin-section"
import { AdminExpenseManagementTable } from "@/components/admin-expense-management-table"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/admin")
  }

  const admins = await getAdmins()
  const expenses = await getAllExpenses()
  const stats = await getExpenseStats()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">Manage expense heads and admin accounts</p>
      </div>

      <AdminSection admins={admins} currentAdminId={session.user.id} />

      <div className="mt-10">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Expense Management</h2>
          <p className="mt-1 text-sm text-gray-600">Review entries in table format with search and pagination</p>
        </div>
        <AdminExpenseManagementTable expenses={expenses} totalReceivedAmount={stats?.collectionAmount ?? 0} />
      </div>
    </div>
  )
}
