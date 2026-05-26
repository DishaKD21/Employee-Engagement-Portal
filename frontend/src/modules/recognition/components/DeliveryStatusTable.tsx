"use client";

import type { RecognitionEventRecord } from "../services/recognition.service";
import type { RecognitionDeliveryRecord } from "../services/recognition.service";

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

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Employee</th>
            <th className="px-4 py-3 font-medium">Event Type</th>
            <th className="px-4 py-3 font-medium">Channel</th>
            <th className="px-4 py-3 font-medium">Delivery Status</th>
            <th className="px-4 py-3 font-medium">Retry Count</th>
            <th className="px-4 py-3 font-medium">Delivered At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {deliveryRows.map(({ event, delivery }) => (
            <tr key={`${event.eventId}-${delivery?.id ?? "pending"}`} className="text-slate-800">
              <td className="px-4 py-4 font-medium">{event.employeeName ?? "-"}</td>
              <td className="px-4 py-4">{event.eventType ?? "-"}</td>
              <td className="px-4 py-4">{delivery?.channel ?? "-"}</td>
              <td className="px-4 py-4">{delivery?.deliveryStatus ?? event.deliveryStatus ?? "-"}</td>
              <td className="px-4 py-4">{delivery?.retryCount ?? 0}</td>
              <td className="px-4 py-4">{delivery?.deliveredAt ?? "-"}</td>
            </tr>
          ))}

          {!deliveryRows.length ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                No delivery history available.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}