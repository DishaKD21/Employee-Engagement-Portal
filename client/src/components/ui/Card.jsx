export default function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`card-surface rounded-3xl p-6 ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-lg font-semibold text-white">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
