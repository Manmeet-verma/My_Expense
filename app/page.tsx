import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function Home() {
  try {
    const session = await auth()

    if (session?.user) {
      redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard")
    } else {
      redirect("/login")
    }
  } catch (error) {
    console.error("Home page auth error:", error)
    redirect("/login")
  }
}
