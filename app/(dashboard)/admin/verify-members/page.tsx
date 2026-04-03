'use server'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getMembers, verifyMemberPassword } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import React from 'react'

type MemberRow = {
  id: string
  name: string | null
  email: string
  createdAt: Date
  _count: {
    expenses: number
  }
}

export default async function VerifyMembersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const members = await getMembers()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Member Password Verification</h1>
        <p className="mt-1 text-gray-600">
          Check which members have valid passwords set up for login
        </p>
      </div>

      <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            If a member shows &quot;No Password&quot;, use the Reset Member Password feature to set one.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {members.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No members found
            </CardContent>
          </Card>
        ) : (
          members.map((member: MemberRow) => (
            <MemberPasswordCard key={member.id} member={member} />
          ))
        )}
      </div>
    </div>
  )
}

function MemberPasswordCard({ member }: { member: MemberRow }) {
  'use client'

  type PasswordStatus = {
    hasPassword?: boolean
    error?: string
    message?: string
  }

  const [status, setStatus] = React.useState<PasswordStatus | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleCheck = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await verifyMemberPassword({ memberId: member.id })
      setStatus(result)
    } catch {
      setStatus({ error: 'Failed to check password' })
    } finally {
      setLoading(false)
    }
  }, [member.id])

  React.useEffect(() => {
    // Auto-check on mount
    void handleCheck()
  }, [handleCheck])

  const hasPassword = status?.hasPassword
  const isError = status?.error

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{member.name || member.email}</p>
            <p className="text-sm text-gray-600">{member.email}</p>
          </div>

          <div className="flex items-center gap-3">
            {!isError && status && (
              <div className="flex items-center gap-2">
                {hasPassword ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Password Set</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">No Password</span>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleCheck}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {isError && (
          <div className="mt-4 text-sm text-red-600">
            {isError}
          </div>
        )}

        {status?.message && (
          <div className="mt-3 text-sm text-gray-600">
            {status.message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

