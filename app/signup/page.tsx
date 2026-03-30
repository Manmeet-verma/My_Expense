import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SignupForm } from "@/components/forms/signup-form"
import { Suspense } from "react"

export default async function SignupPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Member Account</h1>
          <p className="text-gray-600 mt-2">Admin access only</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}
