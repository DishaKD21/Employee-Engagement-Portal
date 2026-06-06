import type { ReactNode } from "react";
import { Pagination, ScrollArea } from "@mantine/core";

type CardProps = {
  children: ReactNode;
  className?: string;
};

type DataViewportProps = {
  children: ReactNode;
  height?: number;
  className?: string;
};

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

type StatusTone = "success" | "warning" | "error" | "info" | "neutral" | "pending" | "approved" | "rejected" | "escalated" | "resolved";

type BadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
};

type PaginationBarProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  disabled?: boolean;
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

const buttonVariants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-500",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-blue-500",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-blue-500",
  danger: "border border-rose-200 bg-white text-rose-700 hover:border-rose-300 hover:bg-rose-50 focus-visible:ring-rose-500",
};

const badgeVariants: Record<StatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  error: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  info: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  escalated: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  resolved: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
};

function joinClasses(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function EnterpriseCard({ children, className }: CardProps) {
  return <div className={joinClasses("rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, description, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">{eyebrow}</p> : null}
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function EnterpriseBadge({ children, tone = "neutral", className }: BadgeProps) {
  return <span className={joinClasses("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", badgeVariants[tone], className)}>{children}</span>;
}

export function EnterpriseButton({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={joinClasses(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

const fieldClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export function EnterpriseInput({ className, ...props }: InputProps) {
  return <input className={joinClasses(fieldClassName, className)} {...props} />;
}

export function EnterpriseTextarea({ className, ...props }: TextareaProps) {
  return <textarea className={joinClasses(fieldClassName, "min-h-[120px] resize-y", className)} {...props} />;
}

export function EnterpriseSelect({ className, ...props }: SelectProps) {
  return <select className={joinClasses(fieldClassName, className)} {...props} />;
}

export function EnterpriseLabel({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={joinClasses("block text-sm font-semibold text-slate-700", className)} {...props}>
      {children}
    </label>
  );
}

export function EnterpriseHelperText({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-5 text-slate-500">{children}</p>;
}

export function MetricCard({ label, value, helper, icon }: MetricCardProps) {
  return (
    <EnterpriseCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {helper ? <p className="mt-1 text-sm text-slate-500">{helper}</p> : null}
        </div>
        {icon ? <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{icon}</div> : null}
      </div>
    </EnterpriseCard>
  );
}

export function DataTableShell({ children, className }: CardProps) {
  return <div className={joinClasses("overflow-hidden rounded-xl border border-slate-200 bg-white", className)}>{children}</div>;
}

export function DataViewport({ children, height = 560, className }: DataViewportProps) {
  return (
    <ScrollArea h={height} type="always" offsetScrollbars scrollbarSize={8} className={className}>
      {children}
    </ScrollArea>
  );
}

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
      {icon ? <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">{icon}</div> : null}
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description ? <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PaginationBar({ page, totalPages, total, pageSize, onChange, onPageSizeChange, disabled }: PaginationBarProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Showing {from}{"\u2013"}{to} of {total} records
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange ? (
          <EnterpriseSelect
            aria-label="Records per page"
            className="w-[112px] py-2"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            disabled={disabled}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </EnterpriseSelect>
        ) : null}
        <Pagination total={Math.max(1, totalPages)} value={page} onChange={onChange} disabled={disabled} withEdges />
      </div>
    </div>
  );
}
