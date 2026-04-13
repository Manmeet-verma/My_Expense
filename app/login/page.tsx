import { LoginForm } from "@/components/forms/login-form"
import { Footer } from "@/components/footer"

export default async function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.1),_transparent_35%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)]">
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-white/70 px-4 py-1 text-sm font-medium text-sky-700 shadow-sm backdrop-blur">
              Demo login for three roles
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Expense Manager access for members, supervisors, and admins.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Use the demo accounts on the right to see how each role is routed. Members go to the dashboard,
                while supervisors and admins open the admin workspace.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                <div className="text-sm font-semibold text-slate-900">Member</div>
                <div className="mt-2 text-sm text-slate-600">Submit expenses and track your own activity.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                <div className="text-sm font-semibold text-slate-900">Supervisor</div>
                <div className="mt-2 text-sm text-slate-600">Review, approve, and manage team submissions.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                <div className="text-sm font-semibold text-slate-900">Admin</div>
                <div className="mt-2 text-sm text-slate-600">Handle users, budgets, and full system controls.</div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <LoginForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
