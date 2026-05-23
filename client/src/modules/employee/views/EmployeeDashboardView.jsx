"use client";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import { useEmployeeDashboardData } from "@/modules/employee/hooks/useEmployeeData";
import SectionHeader from "@/modules/employee/components/SectionHeader";
import { formatDate, formatDateTime } from "@/utils/format";

function previewItems(items, labelKey, dateKey) {
  return Array.isArray(items) ? items.slice(0, 3).map((item) => ({
    id: item.eventId || item.surveyId || item.notificationId || item.id || item.queryId,
    title: item[labelKey] || item.title || item.eventName || item.message || "Untitled",
    date: dateKey ? item[dateKey] : item.createdAt,
    raw: item,
  })) : [];
}

export default function EmployeeDashboardView() {
  const { data, loading, error } = useEmployeeDashboardData();

  if (loading) return <Loader label="Loading employee dashboard" />;
  if (error) return <EmptyState title="Unable to load dashboard" description={error} />;

  const profile = data?.profile || {};
  const events = previewItems(data?.events, "eventName", "eventDate");
  const surveys = previewItems(data?.surveys, "title", "createdAt");
  const notifications = previewItems(data?.notifications, "title", "createdAt");

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Dashboard"
        title={`Welcome${profile.name ? `, ${profile.name}` : ""}`}
        description="This screen is fully API-driven and surfaces your employee data from the backend."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Profile" subtitle={profile.email || "Employee account"}>
          <div className="space-y-2 text-sm text-slate-300">
            <p>{profile.department || "No department set"}</p>
            <p>{profile.location || "No location set"}</p>
          </div>
        </Card>
        <Card title="Events" subtitle={`${data?.events?.length || 0} available`} />
        <Card title="Surveys" subtitle={`${data?.surveys?.length || 0} available`} />
        <Card title="Notifications" subtitle={`${data?.notifications?.length || 0} received`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Upcoming events">
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{formatDate(event.date)}</p>
                  </div>
                  <Badge tone={event.raw?.participants?.length ? "success" : "neutral"}>
                    {event.raw?.participants?.length ? "Registered" : "Open"}
                  </Badge>
                </div>
              </div>
            ))}
            {!events.length ? <EmptyState title="No events" description="There are no employee events available right now." /> : null}
          </div>
        </Card>

        <Card title="Recent surveys">
          <div className="space-y-4">
            {surveys.map((survey) => (
              <div key={survey.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{survey.title}</p>
                <p className="mt-1 text-sm text-slate-400">Created {formatDate(survey.date)}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-300/80">
                  {survey.raw?.responses?.length ? "Submitted" : "Pending"}
                </p>
              </div>
            ))}
            {!surveys.length ? <EmptyState title="No surveys" description="There are no employee surveys available right now." /> : null}
          </div>
        </Card>

        <Card title="Notifications">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
                <p className="mt-2 text-xs text-slate-500">{formatDateTime(notification.date)}</p>
              </div>
            ))}
            {!notifications.length ? <EmptyState title="No notifications" description="Your notification inbox is empty." /> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
