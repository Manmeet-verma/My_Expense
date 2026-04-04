import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FundDistributionForm } from "@/components/admin-fund-distribution-form"

export default async function FundDistributionPage() {
  let session = null
  try {
    session = await auth()
  } catch (error) {
    console.error("Fund distribution page auth error:", error)
    redirect("/login")
  }

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Distribute Fund to Members</h1>
        <p className="text-gray-600 mt-1">Give money to members from the admin account</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <FundDistributionForm />
      </div>
    </div>
  )
}
