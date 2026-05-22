import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import UpdateStatusForm from "./UpdateStatusForm";
import type { OrderStatus } from "@/lib/types";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*, customer:customers(*), measurement:measurements(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer;
  const measurement = Array.isArray(order.measurement) ? order.measurement[0] : order.measurement;
  const balance = (Number(order.price) || 0) - (Number(order.advance_paid) || 0);

  const measurementFields = [
    { key: "chest", label: "Chest" },
    { key: "waist", label: "Waist" },
    { key: "hips", label: "Hips" },
    { key: "shoulder", label: "Shoulder" },
    { key: "sleeve_length", label: "Sleeve" },
    { key: "inseam", label: "Inseam" },
    { key: "outseam", label: "Outseam" },
    { key: "neck", label: "Neck" },
    { key: "back_length", label: "Back" },
    { key: "front_length", label: "Front" },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Orders
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.garment_type}</h1>
            <p className="text-gray-500 mt-1">
              for{" "}
              <Link
                href={`/customers/${customer?.id}`}
                className="text-indigo-600 hover:underline font-medium"
              >
                {customer?.name ?? "Unknown"}
              </Link>
            </p>
          </div>
          <StatusBadge status={order.status as OrderStatus} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 uppercase font-medium">Price</p>
            <p className="text-lg font-bold text-gray-900 mt-1">Rs. {Number(order.price).toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 uppercase font-medium">Advance</p>
            <p className="text-lg font-bold text-gray-900 mt-1">Rs. {Number(order.advance_paid).toLocaleString()}</p>
          </div>
          <div className={`rounded-xl p-3 ${balance > 0 ? "bg-red-50" : "bg-green-50"}`}>
            <p className="text-xs text-gray-500 uppercase font-medium">Balance</p>
            <p className={`text-lg font-bold mt-1 ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
              {balance > 0 ? `Rs. ${balance.toLocaleString()}` : "Paid"}
            </p>
          </div>
          {order.fabric && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase font-medium">Fabric</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{order.fabric}</p>
            </div>
          )}
          {order.due_date && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase font-medium">Due Date</p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {new Date(order.due_date).toLocaleDateString()}
              </p>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 uppercase font-medium">Created</p>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {order.description && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-medium">Description / Instructions</p>
            <p className="text-gray-900 mt-1">{order.description}</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <UpdateStatusForm orderId={id} currentStatus={order.status as OrderStatus} />
        </div>
      </div>

      {measurement && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Measurement: {measurement.label}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {measurementFields.map(({ key, label }) => (
              <div key={key} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-base font-bold text-gray-900 mt-1">
                  {measurement[key] != null ? `${measurement[key]}"` : "—"}
                </p>
              </div>
            ))}
          </div>
          {measurement.notes && (
            <p className="text-sm text-gray-500 mt-4 italic">{measurement.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
