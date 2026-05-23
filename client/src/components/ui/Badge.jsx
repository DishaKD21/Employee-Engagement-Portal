export default function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-slate-800 text-slate-200 border border-slate-700",
    success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    info: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.neutral}`}>{children}</span>;
}
