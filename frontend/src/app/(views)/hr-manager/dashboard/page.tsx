import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">HR Manager Dashboard</h1>
          <p className="mt-2 text-slate-600">Review event and survey submissions before they reach employees.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/hr-manager/approvals" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">Event Approvals</h2>
            <p className="mt-2 text-sm text-slate-600">Approve or reject submitted event workflows.</p>
          </Link>

          <Link href="/hr-manager/template-approvals" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">Template Approvals</h2>
            <p className="mt-2 text-sm text-slate-600">Review automated recognition templates before they go live.</p>
          </Link>

          <Link href="/hr-manager/survey-approvals" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">Survey Approvals</h2>
            <p className="mt-2 text-sm text-slate-600">Approve or reject submitted survey workflows.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
