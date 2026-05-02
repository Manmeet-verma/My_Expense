import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function AssignmentsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERVISOR") {
    redirect("/dashboard")
  }

  // Redirect to admin dashboard as assignments are managed through the main admin page
  redirect("/admin")
}
