"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { useToast } from "@/components/Toast";

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
  const { toast } = useToast();
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

    toast(`Status updated to ${ORDER_STATUS_LABELS[status]}`);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="status" className="text-sm font-medium text-gray-700">
        Update Status:
      </label>
      <select
        id="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Updating...
          </>
        ) : (
          "Update"
        )}
      </button>
    </div>
  );
}
