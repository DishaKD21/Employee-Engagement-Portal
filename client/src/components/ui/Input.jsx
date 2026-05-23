export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-200">
      {label ? <span className="font-medium text-slate-300">{label}</span> : null}
      <input
        className={`w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 ${className}`}
        {...props}
      />
      {error ? <span className="text-sm text-rose-400">{error}</span> : null}
    </label>
  );
}
