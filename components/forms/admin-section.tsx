"use client"

import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { CreateAdminForm } from "@/components/forms/create-admin-form"
import { UserPlus } from "lucide-react"

export function AdminSection() {
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Admin Accounts</h2>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Create New Admin
          </Button>
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
    </>
  )
}
