"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreateSupervisorForm } from "@/components/forms/create-supervisor-form"
import { deleteSupervisor } from "@/actions/auth"
import { formatDate } from "@/lib/utils"
import { UserPlus, Trash2 } from "lucide-react"

type Supervisor = {
  id: string
  name: string | null
  email: string
  createdAt: Date
}

interface SupervisorSectionProps {
  supervisors: Supervisor[]
}

export function SupervisorSection({ supervisors }: SupervisorSectionProps) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleDelete(supervisorId: string) {
    if (!confirm("Are you sure you want to delete this supervisor?")) {
      return
    }

    setDeletingId(supervisorId)
    setError("")

    const result = await deleteSupervisor({ supervisorId })

    if (result?.error) {
      setError(result.error)
    }

    setDeletingId(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Supervisor Accounts</h2>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Create New Supervisor
          </Button>
        )}
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <CreateSupervisorForm />
          <div className="mt-3">
            <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {supervisors.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {supervisors.map((supervisor) => (
                <tr key={supervisor.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{supervisor.name || "N/A"}</td>
                  <td className="px-4 py-3 text-gray-700">{supervisor.email}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(supervisor.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(supervisor.id)}
                      disabled={deletingId === supervisor.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
          No supervisor accounts found
        </div>
      )}
    </>
  )
}
