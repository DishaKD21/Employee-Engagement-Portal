"use client";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import SectionHeader from "@/modules/employee/components/SectionHeader";
import { useEmployeeEventsData } from "@/modules/employee/hooks/useEmployeeData";
import { formatDate } from "@/utils/format";

export default function EmployeeEventsView() {
  const { data, loading, error } = useEmployeeEventsData();

  if (loading) return <Loader label="Loading events" />;
  if (error) return <EmptyState title="Unable to load events" description={error} />;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Employee events" title="Events available to you" description="Pulled directly from GET /api/v1/employees/events." />

      <div className="grid gap-4 xl:grid-cols-2">
        {(data || []).map((event) => (
          <Card
            key={event.eventId}
            title={event.eventName || "Event"}
            subtitle={`${event.eventType || "General"} • ${formatDate(event.eventDate)}`}
            action={<Badge tone={event.participants?.length ? "success" : "neutral"}>{event.participants?.length ? "Registered" : "Available"}</Badge>}
          >
            <div className="space-y-3 text-sm text-slate-300">
              <p>{event.description || "No description provided."}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <p><span className="text-slate-500">Target:</span> {event.targetAudience || "All employees"}</p>
                <p><span className="text-slate-500">Status:</span> {event.status || "draft"}</p>
              </div>
            </div>
          </Card>
        ))}
        {!data?.length ? <EmptyState title="No events" description="There are no events available for your account." /> : null}
      </div>
    </div>
  );
}
