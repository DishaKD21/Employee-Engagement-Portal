"use client";

import type { RecognitionNotificationRecord } from "../services/recognition.service";

type Props = {
  notifications: RecognitionNotificationRecord[];
  onMarkRead?: (notificationId: number) => void;
};

export default function NotificationPanel({ notifications, onMarkRead }: Props) {
  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const unread = !notification.readAt;

        return (
          <article key={notification.notificationId} className={`rounded-2xl border bg-white p-5 shadow-sm ${unread ? "border-slate-300" : "border-slate-200 opacity-85"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{notification.title ?? "Notification"}</h3>
                <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${unread ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {unread ? "Unread" : "Read"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{notification.notificationType ?? "Notification"}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Channel: {notification.channel ?? "-"}</span>
              <span>Status: {notification.status ?? "-"}</span>
              <span>Retries: {notification.retryCount ?? 0}</span>
            </div>

            {!notification.readAt && onMarkRead ? (
              <button
                type="button"
                onClick={() => onMarkRead(notification.notificationId)}
                className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Mark As Read
              </button>
            ) : null}
          </article>
        );
      })}

      {!notifications.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No notifications available.</div> : null}
    </div>
  );
}