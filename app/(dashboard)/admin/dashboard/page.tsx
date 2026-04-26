import { auth } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getMembers } from "@/actions/auth"
import { getAdmins } from "@/actions/auth"
import { getAllExpenses, getExpenseStats } from "@/actions/expense"
import { AdminSection } from "@/components/forms/admin-section"
import { AdminExpenseManagementTable } from "@/components/admin-expense-management-table"
import MembersContent from "../members/members-content"
import { buttonVariants } from "@/components/ui/button"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/admin")
  }

  let admins: any[] = []
  let members: any[] = []
  let expenses: any[] = []
  let stats: any = null

  try {
    admins = await getAdmins()
  } catch (error) {
    console.error("Failed to load admins:", error)
  }

  try {
    members = await getMembers()
  } catch (error) {
    console.error("Failed to load members:", error)
  }

  try {
    expenses = await getAllExpenses()
  } catch (error) {
    console.error("Failed to load dashboard expenses:", error)
  }

  try {
    stats = await getExpenseStats()
  } catch (error) {
    console.error("Failed to load expense stats:", error)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">Manage expense heads and admin accounts</p>
      </div>

      <AdminSection admins={admins} currentAdminId={session.user.id} />

      <div className="mt-10">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Member List</h2>
            <p className="mt-1 text-sm text-gray-600">
              Open the same member page used in the sidebar for full member expense details.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/members" className={buttonVariants({ variant: "outline" })}>
              Open Full Member Page
            </Link>
          </div>
        </div>
        <MembersContent members={members} canManage canApproveExpenses={false} />
      </div>

      <div className="mt-10">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Expense Management</h2>
          <p className="mt-1 text-sm text-gray-600">Review entries in table format with search and pagination</p>
        </div>
        {expenses.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
            Expense management data could not be loaded right now, but the member list is still available above.
          </div>
        ) : (
          <AdminExpenseManagementTable expenses={expenses} totalReceivedAmount={stats?.collectionAmount ?? 0} />
        )}
      </div>
    </div>
  )
}
