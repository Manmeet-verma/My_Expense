import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getMembers } from "@/actions/auth"
import MembersContent from "./members-content"

type MemberRow = {
  id: string
  name: string | null
  email: string
  totalBudget: number
  totalEdits: number
  createdAt: Date
  _count: {
    expenses: number
  }
}

export default async function AdminMembersPage() {
  let session = null
  try {
    session = await auth()
  } catch (error) {
    console.error("Auth error:", error)
    redirect("/login")
  }

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  let members: MemberRow[] = []
  try {
    const result = await getMembers()
    members = (result || []) as MemberRow[]
  } catch (error) {
    console.error("getMembers error:", error)
    members = []
  }

  return <MembersContent members={members} />
}