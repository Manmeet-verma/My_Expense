import { auth } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAdmins } from "@/actions/auth"
import { getCategoryStatistics } from "@/actions/category"
import { AdminSection } from "@/components/forms/admin-section"
import { buttonVariants } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/admin")
  }

  const admins = await getAdmins()
  const categories = await getCategoryStatistics()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">Create admin accounts and manage admin list</p>
      </div>

      <AdminSection admins={admins} currentAdminId={session.user.id} />

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Category Usage</h2>
          <Link href="/admin/add-category" className={buttonVariants()}>
            Create Category
          </Link>
        </div>

        <div className="md:hidden space-y-3">
          {categories.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              No categories added yet
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-600">{category.description || "No description"}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Members Used</p>
                    <p className="font-medium text-gray-900">{category.memberCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Expense Count</p>
                    <p className="font-medium text-gray-900">{category.expenseCount}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Total Expense</p>
                    <p className="font-medium text-gray-900">{formatCurrency(category.totalAmount)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Members Used</th>
                <th className="px-4 py-3 font-semibold">Expense Count</th>
                <th className="px-4 py-3 font-semibold">Total Expense</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No categories added yet
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                    <td className="px-4 py-3 text-gray-700">{category.description || "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{category.memberCount}</td>
                    <td className="px-4 py-3 text-gray-700">{category.expenseCount}</td>
                    <td className="px-4 py-3 text-gray-900">{formatCurrency(category.totalAmount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
