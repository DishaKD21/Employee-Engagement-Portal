"use client";

import type { ReactNode } from "react";
import { EnterpriseBadge, EnterpriseButton, EnterpriseCard } from "@/components/ui/enterprise";

type Props = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  badge?: string | null;
  footer?: ReactNode;
  onClick?: () => void;
};

export default function RecognitionCard({ title, subtitle, description, badge, footer, onClick }: Props) {
  return (
    <EnterpriseCard className="p-5 text-left transition hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {badge ? <EnterpriseBadge tone={badge.toLowerCase() === "approved" ? "approved" : badge.toLowerCase() === "rejected" ? "rejected" : badge.toLowerCase() === "pending" ? "pending" : "neutral"}>{badge}</EnterpriseBadge> : null}
      </div>

      {description ? <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p> : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
      {onClick ? (
        <div className="mt-4">
          <EnterpriseButton variant="secondary" onClick={onClick} className="w-full">
            View details
          </EnterpriseButton>
        </div>
      ) : null}
    </EnterpriseCard>
  );
}