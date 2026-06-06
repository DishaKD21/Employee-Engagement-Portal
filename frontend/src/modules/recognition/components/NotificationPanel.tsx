"use client";

import type { RecognitionNotificationRecord } from "../services/recognition.service";
import { Checkbox } from "@mantine/core";
import { Bell } from "lucide-react";
import { DataViewport, EmptyState, EnterpriseBadge, EnterpriseButton, EnterpriseCard, PaginationBar } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

type Props = {
  notifications: RecognitionNotificationRecord[];
  onMarkRead?: (notificationId: number) => void;
};

export default function NotificationPanel({ notifications, onMarkRead }: Props) {
  const pagination = useClientPagination(notifications);
  const selection = useRowSelection(
    pagination.paginatedItems.map((notification) => notification.notificationId),
    notifications.map((notification) => notification.notificationId),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <Checkbox checked={selection.allVisibleSelected} indeterminate={selection.someVisibleSelected} onChange={selection.toggleVisible} label="Select all" />
        <span>{selection.selectedCount} items selected</span>
        {selection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={selection.clearSelection}>Deselect all</button> : null}
      </div>
      <DataViewport height={560}>
        <div className="space-y-3 pr-3">
      {pagination.paginatedItems.map((notification) => {
        const unread = !notification.readAt;

        return (
          <EnterpriseCard key={notification.notificationId} className={`p-5 ${unread ? "border-slate-300" : "opacity-90"}`}>
            <div className="flex items-start gap-3">
              <Checkbox checked={selection.selectedSet.has(notification.notificationId)} onChange={() => selection.toggleOne(notification.notificationId)} aria-label={`Select ${notification.title ?? "notification"}`} />
              <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{notification.title ?? "Notification"}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <EnterpriseBadge tone={unread ? "warning" : "success"}>{unread ? "Unread" : "Read"}</EnterpriseBadge>
                <EnterpriseBadge tone="neutral">{notification.notificationType ?? "Notification"}</EnterpriseBadge>
              </div>
            </div>
            </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Channel: {notification.channel ?? "-"}</span>
              <span>Status: {notification.status ?? "-"}</span>
              <span>Retries: {notification.retryCount ?? 0}</span>
            </div>

            {!notification.readAt && onMarkRead ? (
              <EnterpriseButton
                type="button"
                onClick={() => onMarkRead(notification.notificationId)}
                className="mt-4"
                variant="secondary"
              >
                Mark As Read
              </EnterpriseButton>
            ) : null}
          </EnterpriseCard>
        );
      })}

      {!notifications.length ? <EmptyState title="No notifications available." description="Recognition, survey, and system messages will appear here." icon={<Bell className="h-5 w-5" />} /> : null}
        </div>
      </DataViewport>
      <PaginationBar {...pagination} onChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
    </div>
  );
}
