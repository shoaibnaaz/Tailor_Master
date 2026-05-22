"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "cutting",
  "stitching",
  "finishing",
  "ready",
  "delivered",
  "cancelled",
];

export default function UpdateStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    if (status === currentStatus) return;
    setLoading(true);

    const updates: Record<string, string | null> = { status };
    if (status === "delivered") {
      updates.completed_at = new Date().toISOString();
    } else {
      updates.completed_at = null;
    }

    await supabase.from("orders").update(updates).eq("id", orderId);

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="status" className="text-sm font-medium text-gray-700">
        Update Status:
      </label>
      <select
        id="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update"}
      </button>
    </div>
  );
}
