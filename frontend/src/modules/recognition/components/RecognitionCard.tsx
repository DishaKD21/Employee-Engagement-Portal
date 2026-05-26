"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  badge?: string | null;
  footer?: ReactNode;
  onClick?: () => void;
};

export default function RecognitionCard({ title, subtitle, description, badge, footer, onClick }: Props) {
  const CardTag = onClick ? "button" : "article";

  return (
    <CardTag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {badge ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">{badge}</span> : null}
      </div>

      {description ? <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p> : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </CardTag>
  );
}