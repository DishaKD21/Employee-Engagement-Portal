export default function SectionHeader({ eyebrow, title, description }) {
  return (
    <div>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p> : null}
    </div>
  );
}
