import Button from "@/components/ui/Button";

export default function EmptyState({ title = "Nothing to show", description, actionLabel, onAction }) {
  return (
    <div className="card-surface flex flex-col gap-4 rounded-3xl p-8 text-center">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
      </div>
      {actionLabel ? <Button className="mx-auto" onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
