import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";

export default function EmployeeKnowledgeBaseView() {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-600">HR Help</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">HR Knowledge Base</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        The knowledge base backend is not wired in the current frontend route tree, so this view stays empty until that API is connected.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/employee/events"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-white"
        >
          <BookOpenText className="h-4.5 w-4.5 text-violet-600" />
          Explore Employee Events
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>
      </div>
    </section>
  );
}