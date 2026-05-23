export default function AuthPageShell({ eyebrow, title, subtitle, children }) {
  return (
    <div className="auth-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Employee Engagement Platform</p>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight text-white">
              Modern HR authentication, built for real workflows.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Secure JWT sessions, role-based routing, and API-first user flows for employee operations.
            </p>
          </div>
          <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">JWT session persistence</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Protected routes</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Role-aware navigation</div>
          </div>
        </section>

        <section className="card-surface rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-3 text-sm leading-6 text-slate-400">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </div>
  );
}
