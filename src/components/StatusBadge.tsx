import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
