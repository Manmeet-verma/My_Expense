import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FundDistributionForm } from "@/components/admin-fund-distribution-form"
import { getDistributedFundTransactions } from "@/actions/expense"
import { formatCurrency } from "@/lib/utils"

function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value))
}

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

  const transactions = await getDistributedFundTransactions()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Distribute Fund to Members</h1>
        <p className="text-gray-600 mt-1">Give money to members from the admin account</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <FundDistributionForm />
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">Distribution Transactions</h2>
          </div>

          <div className="p-4">
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-500">No distribution transactions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Member</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Transaction Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {transaction.user.name || transaction.user.email}
                        </td>
                        <td className="px-4 py-3 text-gray-900">{formatCurrency(transaction.amount)}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDateTime(transaction.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
