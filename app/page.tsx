import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function Home() {
  try {
    const session = await auth()

    if (session?.user) {
      if (session.user.role === "ADMIN" || session.user.role === "SUPERVISOR") {
        redirect("/admin")
      } else {
        redirect("/dashboard")
      }
    } else {
      redirect("/login")
    }
  } catch (error) {
    console.error("Home page auth error:", error)
    redirect("/login")
  }
}
