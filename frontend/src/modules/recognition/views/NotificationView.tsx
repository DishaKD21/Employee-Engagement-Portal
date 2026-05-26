"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import NotificationPanel from "../components/NotificationPanel";
import { getNotifications, markNotificationRead } from "../services/notification.service";
import type { RecognitionNotificationRecord } from "../services/recognition.service";

export default function NotificationView() {
  const token = useAuthStore((state) => state.token);
  const [notifications, setNotifications] = useState<RecognitionNotificationRecord[]>([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadNotifications() {
    if (!token) return;

    try {
      setNotifications(await getNotifications(token));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load notifications"));
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, [token]);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.readAt).length, [notifications]);

  const handleMarkRead = async (notificationId: number) => {
    if (!token) return;

    try {
      await markNotificationRead(notificationId, token);
      setMessage("Notification marked as read.");
      await loadNotifications();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to update notification"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-2 text-slate-600">Track recognition, survey, and system messages in one place.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{notifications.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unread</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{unreadCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Read</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{notifications.length - unreadCount}</p>
          </div>
        </div>

        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        <NotificationPanel notifications={notifications} onMarkRead={(notificationId) => void handleMarkRead(notificationId)} />
      </div>
    </div>
  );
}