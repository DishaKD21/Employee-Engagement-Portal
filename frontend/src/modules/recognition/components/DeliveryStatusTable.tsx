"use client";

import type { RecognitionEventRecord } from "../services/recognition.service";
import type { RecognitionDeliveryRecord } from "../services/recognition.service";
import { Checkbox } from "@mantine/core";
import { DataTableShell, DataViewport, EmptyState, EnterpriseBadge, PaginationBar } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

type Props = {
  events: RecognitionEventRecord[];
};

type DeliveryRow = {
  event: RecognitionEventRecord;
  delivery: RecognitionDeliveryRecord | null;
};

export default function DeliveryStatusTable({ events }: Props) {
  const deliveryRows = events.reduce<DeliveryRow[]>((rows, event) => {
    if (event.deliveryLogs.length) {
      rows.push(...event.deliveryLogs.map((delivery) => ({ event, delivery })));
      return rows;
    }

    rows.push({ event, delivery: null });
    return rows;
  }, []);
  const pagination = useClientPagination(deliveryRows);
  const visibleIds = pagination.paginatedItems.map(({ event, delivery }) => `${event.eventId}-${delivery?.id ?? "pending"}`);
  const allIds = deliveryRows.map(({ event, delivery }) => `${event.eventId}-${delivery?.id ?? "pending"}`);
  const selection = useRowSelection(visibleIds, allIds);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <Checkbox checked={selection.allVisibleSelected} indeterminate={selection.someVisibleSelected} onChange={selection.toggleVisible} label="Select all" />
        <span>{selection.selectedCount} items selected</span>
        {selection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={selection.clearSelection}>Deselect all</button> : null}
      </div>
      <DataTableShell>
        <DataViewport height={500}>
          <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-[1] bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="w-12 px-5 py-3 font-semibold"></th>
            <th className="px-5 py-3 font-semibold">Employee</th>
            <th className="px-5 py-3 font-semibold">Event Type</th>
            <th className="px-5 py-3 font-semibold">Channel</th>
            <th className="px-5 py-3 font-semibold">Delivery Status</th>
            <th className="px-5 py-3 font-semibold">Retry Count</th>
            <th className="px-5 py-3 font-semibold">Delivered At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {pagination.paginatedItems.map(({ event, delivery }) => (
            <tr key={`${event.eventId}-${delivery?.id ?? "pending"}`} className="text-slate-800 hover:bg-slate-50/80">
              <td className="px-5 py-4">
                <Checkbox
                  checked={selection.selectedSet.has(`${event.eventId}-${delivery?.id ?? "pending"}`)}
                  onChange={() => selection.toggleOne(`${event.eventId}-${delivery?.id ?? "pending"}`)}
                  aria-label={`Select delivery row ${event.eventId}`}
                />
              </td>
              <td className="px-5 py-4 font-medium text-slate-900">{event.employeeName ?? "-"}</td>
              <td className="px-5 py-4">{event.eventType ?? "-"}</td>
              <td className="px-5 py-4">{delivery?.channel ?? "-"}</td>
              <td className="px-5 py-4">
                <EnterpriseBadge tone={delivery?.deliveryStatus?.toLowerCase() === "delivered" ? "success" : "warning"}>
                  {delivery?.deliveryStatus ?? event.deliveryStatus ?? "-"}
                </EnterpriseBadge>
              </td>
              <td className="px-5 py-4">{delivery?.retryCount ?? 0}</td>
              <td className="px-5 py-4">{delivery?.deliveredAt ?? "-"}</td>
            </tr>
          ))}

          {!deliveryRows.length ? (
            <tr>
              <td colSpan={7} className="px-5 py-8">
                <EmptyState title="No delivery history available." description="Recognition delivery records will appear here once generated." />
              </td>
            </tr>
          ) : null}
        </tbody>
        </table>
          </div>
        </DataViewport>
      </DataTableShell>
      <PaginationBar {...pagination} onChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
    </div>
  );
}
