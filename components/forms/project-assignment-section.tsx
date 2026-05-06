"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { assignMemberToVerifier, clearMemberAssignment } from "@/actions/auth"
import { Pencil, Trash2 } from "lucide-react"

type Verifier = {
  id: string
  name: string | null
  email: string
}

type Project = {
  id: string
  name: string
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
  projects: Project[]
}

export function ProjectAssignmentSection({ members, verifiers, projects }: ProjectAssignmentSectionProps) {
  const router = useRouter()
  const [memberId, setMemberId] = useState("")
  const [verifierId, setVerifierId] = useState("")
  const [projectId, setProjectId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [clearingId, setClearingId] = useState<string | null>(null)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)

  const groupedAssignments = useMemo(() => {
    return verifiers.map((verifier) => ({
      verifier,
      inputters: members.filter((member) => member.assignedVerifier?.id === verifier.id),
    }))
  }, [members, verifiers])

  const verifierAssignmentCounts = useMemo(() => {
    return groupedAssignments.reduce<Record<string, number>>((counts, group) => {
      counts[group.verifier.id] = group.inputters.length
      return counts
    }, {})
  }, [groupedAssignments])

  const unassignedInputters = useMemo(
    () => members.filter((member) => !member.assignedVerifierId || !member.assignedProject),
    [members]
  )

  async function handleAssign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!memberId || !projectId) {
      alert("Please select inputter and project")
      return
    }

    setSubmitting(true)
    const result = await assignMemberToVerifier({
      memberId,
      verifierId,
      projectId,
    })

    if (result?.error) {
      alert(result.error)
      setSubmitting(false)
      return
    }

    setMemberId("")
    setVerifierId("")
    setProjectId("")
    setSubmitting(false)
    setEditingMemberId(null)
    router.refresh()
  }

  function startEdit(member: Member) {
    setMemberId(member.id)
    setProjectId(projects.find((project) => project.name === member.assignedProject)?.id || "")
    setVerifierId(member.assignedVerifierId || "")
    setEditingMemberId(member.id)
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
    if (editingMemberId === memberIdToClear) {
      setMemberId("")
      setProjectId("")
      setVerifierId("")
      setEditingMemberId(null)
    }
    router.refresh()
  }

  return (
    <section id="project-assignments" className="mt-10 rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Project And Verifier Assignment</h2>
        <p className="mt-1 text-sm text-gray-600">Assign or edit each inputter&apos;s project and verifier from the admin dashboard.</p>
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
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          value={verifierId}
          onChange={(e) => setVerifierId(e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="">No verifier (optional)</option>
          {verifiers.map((verifier) => {
            const assignedCount = verifierAssignmentCounts[verifier.id] ?? 0
            const isFull = assignedCount >= 2
            const label = `${verifier.name || verifier.email} (${assignedCount}/2)`

            return (
              <option key={verifier.id} value={verifier.id} disabled={isFull && verifierId !== verifier.id}>
                {label}
              </option>
            )
          })}
        </select>

        <button
          type="submit"
          disabled={submitting}
          className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? "Saving..." : editingMemberId ? "Update Assignment" : "Assign"}
        </button>
      </form>

      {projects.length === 0 && (
        <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          Create at least one project before assigning inputters.
        </div>
      )}

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
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => startEdit(member)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClear(member.id)}
                        disabled={clearingId === member.id}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {clearingId === member.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
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
