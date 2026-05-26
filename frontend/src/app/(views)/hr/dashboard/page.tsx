import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">HR Dashboard</h1>
          <p className="mt-2 text-slate-600">Create engagement content and submit it for approval.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/hr/events" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">Manage Events</h2>
            <p className="mt-2 text-sm text-slate-600">Create, edit, and submit event workflows for review.</p>
          </Link>

          <Link href="/hr/recognition-templates" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">Recognition Templates</h2>
            <p className="mt-2 text-sm text-slate-600">Create birthday and anniversary templates for approval.</p>
          </Link>

          <Link href="/hr/surveys" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">Manage Surveys</h2>
            <p className="mt-2 text-sm text-slate-600">Create surveys, build questions, and submit them for approval.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
