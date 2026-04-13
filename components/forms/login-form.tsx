"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { BadgeCheck, Eye, EyeOff, ShieldCheck, UserRound } from "lucide-react"
import { demoLoginAccounts, type DemoLoginAccount } from "@/lib/demo-login-accounts"

type LoginFormProps = {
  demoAccounts?: readonly DemoLoginAccount[]
}

function getDemoDestination(email: string, demoAccounts: readonly DemoLoginAccount[]) {
  const normalizedEmail = email.trim().toLowerCase()
  return demoAccounts.find((account) => account.email.toLowerCase() === normalizedEmail)?.destination ?? "/dashboard"
}

export function LoginForm({ demoAccounts = demoLoginAccounts }: LoginFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const selectedDemoAccount = demoAccounts.find(
    (account) => account.email.toLowerCase() === email.trim().toLowerCase()
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const callbackUrl = getDemoDestination(email, demoAccounts)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      })

      if (result?.ok && !result.error) {
        router.replace(result.url || "/dashboard")
        return
      }

      setError(result?.error ? "Invalid email or password" : "Unable to sign in. Please try again.")
    } catch {
      setError("Unable to sign in. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border-slate-200/80 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <ShieldCheck className="h-4 w-4 text-sky-600" />
          Role-based login demo
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">Sign in to your workspace</CardTitle>
        <CardDescription>
          Pick a demo account below or enter your own credentials. Admin and supervisor land in the admin area,
          while members go to their dashboard.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-700">Demo access</p>
              {selectedDemoAccount ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {selectedDemoAccount.role}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  <UserRound className="h-3.5 w-3.5" />
                  Custom login
                </span>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {demoAccounts.map((account) => {
                const isSelected = selectedDemoAccount?.email === account.email

                return (
                  <Button
                    key={account.role}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className="h-auto flex-col items-start justify-start gap-2 rounded-xl px-4 py-3 text-left"
                    onClick={() => {
                      setEmail(account.email)
                      setPassword(account.password)
                      setShowPassword(false)
                      setError("")
                    }}
                  >
                    <span className="text-sm font-semibold">{account.role}</span>
                    <span className="text-xs opacity-90">{account.email}</span>
                    <span className="text-xs opacity-80">{account.description}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Admin and supervisor use the admin workspace. Members are redirected to the dashboard after sign in.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="flex flex-col items-center gap-2 text-sm text-center">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password?
            </Link>
            <p className="text-gray-600">Contact your admin to create a member account.</p>
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Create an account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}