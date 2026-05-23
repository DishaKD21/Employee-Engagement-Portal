"use client";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import SectionHeader from "@/modules/employee/components/SectionHeader";
import { useEmployeeNotificationsData } from "@/modules/employee/hooks/useEmployeeData";
import { formatDateTime } from "@/utils/format";

export default function EmployeeNotificationsView() {
  const { data, loading, error } = useEmployeeNotificationsData();

  if (loading) return <Loader label="Loading notifications" />;
  if (error) return <EmptyState title="Unable to load notifications" description={error} />;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Employee notifications" title="Your notification feed" description="Pulled directly from GET /api/v1/employees/notifications." />

      <div className="space-y-4">
        {(data || []).map((notification) => (
          <Card
            key={notification.notificationId}
            title={notification.title || "Notification"}
            subtitle={formatDateTime(notification.createdAt)}
            action={<Badge tone={notification.readAt ? "success" : "warning"}>{notification.readAt ? "Read" : "Unread"}</Badge>}
          >
            <div className="space-y-2 text-sm text-slate-300">
              <p>{notification.message || "No message content."}</p>
              <p><span className="text-slate-500">Channel:</span> {notification.channel || "—"}</p>
            </div>
          </Card>
        ))}
        {!data?.length ? <EmptyState title="No notifications" description="There are no notifications for your account." /> : null}
      </div>
    </div>
  );
}
