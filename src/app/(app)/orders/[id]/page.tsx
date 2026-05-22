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
    <div className="max-w-3xl mx-auto">
      <Link href="/orders" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        &larr; Back to Orders
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.garment_type}</h1>
            <p className="text-gray-500">
              for{" "}
              <Link
                href={`/customers/${customer?.id}`}
                className="text-indigo-600 hover:underline"
              >
                {customer?.name ?? "Unknown"}
              </Link>
            </p>
          </div>
          <StatusBadge status={order.status as OrderStatus} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Price</p>
            <p className="font-semibold text-gray-900">Rs. {Number(order.price).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Advance Paid</p>
            <p className="font-semibold text-gray-900">Rs. {Number(order.advance_paid).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Balance</p>
            <p className={`font-semibold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
              {balance > 0 ? `Rs. ${balance.toLocaleString()}` : "Paid"}
            </p>
          </div>
          {order.fabric && (
            <div>
              <p className="text-gray-500">Fabric</p>
              <p className="font-semibold text-gray-900">{order.fabric}</p>
            </div>
          )}
          {order.due_date && (
            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.due_date).toLocaleDateString()}
              </p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-semibold text-gray-900">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {order.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Description / Instructions</p>
            <p className="text-gray-900 mt-1">{order.description}</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <UpdateStatusForm orderId={id} currentStatus={order.status as OrderStatus} />
        </div>
      </div>

      {/* Measurement details */}
      {measurement && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Measurement: {measurement.label}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
            {measurementFields.map(({ key, label }) => (
              <div key={key}>
                <p className="text-gray-500">{label}</p>
                <p className="font-semibold text-gray-900">
                  {measurement[key] != null ? `${measurement[key]}"` : "—"}
                </p>
              </div>
            ))}
          </div>
          {measurement.notes && (
            <p className="mt-3 text-sm text-gray-500 italic">{measurement.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
