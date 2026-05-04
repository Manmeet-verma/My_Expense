"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreateAdminForm } from "@/components/forms/create-admin-form"
import { AdminChangePasswordButton } from "@/components/forms/admin-change-password-button"
import { deleteAdmin } from "@/actions/auth"
import { formatDate } from "@/lib/utils"
import { UserPlus, Trash2 } from "lucide-react"

type Admin = {
  id: string
  name: string | null
  fatherName: string | null
  aadhaarNo: string | null
  email: string
  createdAt: Date
}

interface AdminSectionProps {
  admins: Admin[]
  currentAdminId: string
}

export function AdminSection({ admins, currentAdminId }: AdminSectionProps) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleDelete(adminId: string) {
    if (!confirm("Are you sure you want to delete this admin?")) {
      return
    }

    setDeletingId(adminId)
    setError("")

    const result = await deleteAdmin({ adminId })

    if (result?.error) {
      setError(result.error)
    }

    setDeletingId(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Admin Accounts</h2>
        {!showCreateForm && (
          <div className="flex gap-2">
            <AdminChangePasswordButton />
            <Button onClick={() => setShowCreateForm(true)} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Create New Admin
            </Button>
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <CreateAdminForm
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {admins.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="space-y-3 p-4 md:hidden">
            {admins.map((admin) => (
              <div key={admin.id} className="rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-semibold text-gray-900">
                  {admin.name || "N/A"}
                  {admin.id === currentAdminId && (
                    <span className="ml-2 text-xs text-blue-600">(You)</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-gray-700">Father: {admin.fatherName || "N/A"}</p>
                <p className="mt-1 text-sm text-gray-700">Aadhaar: {admin.aadhaarNo || "N/A"}</p>
                <p className="mt-1 text-sm text-gray-700">{admin.email}</p>
                <p className="mt-1 text-xs text-gray-500">Created: {formatDate(admin.createdAt)}</p>

                {admin.id !== currentAdminId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(admin.id)}
                    disabled={deletingId === admin.id}
                    className="mt-3 w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deletingId === admin.id ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <table className="hidden min-w-full text-sm md:table">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Father&apos;s Name</th>
                <th className="px-4 py-3 font-semibold">Aadhaar No.</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-t border-gray-100 odd:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {admin.name || "N/A"}
                    {admin.id === currentAdminId && (
                      <span className="ml-2 text-xs text-blue-600">(You)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{admin.fatherName || "N/A"}</td>
                  <td className="px-4 py-3 text-gray-700">{admin.aadhaarNo || "N/A"}</td>
                  <td className="px-4 py-3 text-gray-700">{admin.email}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(admin.createdAt)}</td>
                  <td className="px-4 py-3">
                    {admin.id !== currentAdminId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(admin.id)}
                        disabled={deletingId === admin.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deletingId === admin.id ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
