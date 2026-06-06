"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import NotificationPanel from "../components/NotificationPanel";
import { getNotifications, markNotificationRead } from "../services/notification.service";
import type { RecognitionNotificationRecord } from "../services/recognition.service";
import { EnterpriseCard, MetricCard, SectionHeader } from "@/components/ui/enterprise";

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
    void loadNotifications(); // eslint-disable-line react-hooks/set-state-in-effect
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
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Notifications"
        title="Notification center"
        description="Track recognition, survey, and system messages in one place."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total" value={String(notifications.length)} helper="All messages" />
        <MetricCard label="Unread" value={String(unreadCount)} helper="Needs attention" />
        <MetricCard label="Read" value={String(notifications.length - unreadCount)} helper="Cleared messages" />
      </div>

      {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

      <EnterpriseCard className="p-6">
        <NotificationPanel notifications={notifications} onMarkRead={(notificationId) => void handleMarkRead(notificationId)} />
      </EnterpriseCard>
    </div>
  );
}
