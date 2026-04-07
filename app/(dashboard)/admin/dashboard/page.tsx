import { auth } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAdmins } from "@/actions/auth"
import { getCategoryStatistics } from "@/actions/category"
import { AdminSection } from "@/components/forms/admin-section"
import { AdminCategoryUsageSection } from "@/components/admin-category-usage-section"
import { buttonVariants } from "@/components/ui/button"

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
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-gray-900">Category Usage</h2>
          <Link href="/admin/add-category" className={buttonVariants()}>
            Create Category
          </Link>
        </div>

        <AdminCategoryUsageSection categories={categories} />
      </div>
    </div>
  )
}
