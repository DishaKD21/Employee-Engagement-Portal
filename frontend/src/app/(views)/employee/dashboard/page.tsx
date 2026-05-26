import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employee Dashboard</h1>
          <p className="mt-2 text-slate-600">Discover published events and surveys, then register or respond.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/employee/events" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">Browse Events</h2>
            <p className="mt-2 text-sm text-slate-600">Open the event board to register for approved and published events.</p>
          </Link>

          <Link href="/employee/notifications" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
            <p className="mt-2 text-sm text-slate-600">Review birthday wishes, anniversaries, surveys, and system alerts.</p>
          </Link>

          <Link href="/employee/surveys" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">Browse Surveys</h2>
            <p className="mt-2 text-sm text-slate-600">Open the survey board to complete approved and active surveys.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
