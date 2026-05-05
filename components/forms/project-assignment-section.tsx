"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { assignMemberToVerifier, clearMemberAssignment } from "@/actions/auth"

type Verifier = {
  id: string
  name: string | null
  email: string
}

type Member = {
  id: string
  name: string | null
  email: string
  assignedProject?: string | null
  assignedVerifierId?: string | null
  assignedVerifier?: {
    id: string
    name: string | null
    email: string
  } | null
}

interface ProjectAssignmentSectionProps {
  members: Member[]
  verifiers: Verifier[]
}

export function ProjectAssignmentSection({ members, verifiers }: ProjectAssignmentSectionProps) {
  const router = useRouter()
  const [memberId, setMemberId] = useState("")
  const [verifierId, setVerifierId] = useState("")
  const [projectName, setProjectName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [clearingId, setClearingId] = useState<string | null>(null)

  const groupedAssignments = useMemo(() => {
    return verifiers.map((verifier) => ({
      verifier,
      inputters: members.filter((member) => member.assignedVerifier?.id === verifier.id),
    }))
  }, [members, verifiers])

  const unassignedInputters = useMemo(
    () => members.filter((member) => !member.assignedVerifierId || !member.assignedProject),
    [members]
  )

  async function handleAssign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!memberId || !projectName.trim()) {
      alert("Please select inputter and enter project name")
      return
    }

    setSubmitting(true)
    const result = await assignMemberToVerifier({
      memberId,
      verifierId,
      projectName: projectName.trim(),
    })

    if (result?.error) {
      alert(result.error)
      setSubmitting(false)
      return
    }

    setMemberId("")
    setVerifierId("")
    setProjectName("")
    setSubmitting(false)
    router.refresh()
  }

  async function handleClear(memberIdToClear: string) {
    if (!window.confirm("Clear assignment for this inputter?")) {
      return
    }

    setClearingId(memberIdToClear)
    const result = await clearMemberAssignment({ memberId: memberIdToClear })

    if (result?.error) {
      alert(result.error)
      setClearingId(null)
      return
    }

    setClearingId(null)
    router.refresh()
  }

  return (
    <section id="project-assignments" className="mt-10 rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Project And Verifier Assignment</h2>
        <p className="mt-1 text-sm text-gray-600">Assign each inputter to a project and verifier from the admin dashboard.</p>
      </div>

      <form onSubmit={handleAssign} className="grid gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 md:grid-cols-4">
        <select
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="">Select inputter</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name || member.email}
            </option>
          ))}
        </select>

        <select
          value={verifierId}
          onChange={(e) => setVerifierId(e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="">No verifier (optional)</option>
          {verifiers.map((verifier) => (
            <option key={verifier.id} value={verifier.id}>
              {verifier.name || verifier.email}
            </option>
          ))}
        </select>

        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
        />

        <button
          type="submit"
          disabled={submitting}
          className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? "Assigning..." : "Assign"}
        </button>
      </form>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {groupedAssignments.map(({ verifier, inputters }) => (
          <div key={verifier.id} className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">{verifier.name || verifier.email}</h3>
            <p className="text-xs text-gray-500">{verifier.email}</p>

            {inputters.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No inputter assigned.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {inputters.map((member) => (
                  <li key={member.id} className="rounded-md border border-gray-100 bg-gray-50 p-2">
                    <p className="text-sm font-medium text-gray-900">{member.name || member.email}</p>
                    <p className="text-xs text-gray-600">Project: {member.assignedProject || "-"}</p>
                    <button
                      type="button"
                      onClick={() => handleClear(member.id)}
                      disabled={clearingId === member.id}
                      className="mt-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-60"
                    >
                      {clearingId === member.id ? "Clearing..." : "Clear Assignment"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Unassigned Inputters</h3>
        {unassignedInputters.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">All inputters are assigned.</p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            {unassignedInputters.map((member) => (
              <li key={member.id}>{member.name || member.email}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
