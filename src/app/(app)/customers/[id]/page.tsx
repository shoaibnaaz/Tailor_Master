import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import MeasurementForm from "./MeasurementForm";
import DeleteCustomerButton from "./DeleteCustomerButton";
import type { OrderStatus } from "@/lib/types";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [customerRes, measurementsRes, ordersRes] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase.from("measurements").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("orders").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);

  const customer = customerRes.data;
  if (!customer) notFound();

  const measurements = measurementsRes.data ?? [];
  const orders = ordersRes.data ?? [];

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
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Customers
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-indigo-600">{customer.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {customer.email}
                  </span>
                )}
              </div>
              {customer.address && (
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {customer.address}
                </p>
              )}
              {customer.notes && (
                <p className="text-sm text-gray-400 mt-1 italic">&quot;{customer.notes}&quot;</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/customers/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <DeleteCustomerButton customerId={id} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{measurements.length}</p>
            <p className="text-xs text-blue-600">Measurements</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{orders.length}</p>
            <p className="text-xs text-green-600">Orders</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">
              Rs. {orders.reduce((s, o) => s + (Number(o.price) || 0), 0).toLocaleString()}
            </p>
            <p className="text-xs text-purple-600">Total Spent</p>
          </div>
        </div>
      </div>

      {/* Measurements */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Measurements</h2>
          <MeasurementForm customerId={id} />
        </div>
        {measurements.length === 0 ? (
          <p className="text-gray-400 text-sm">No measurements recorded yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
                  <th className="pb-2 pr-4">Label</th>
                  {measurementFields.map((f) => (
                    <th key={f.key} className="pb-2 pr-4">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {measurements.map((m) => (
                  <tr key={m.id} className="text-sm">
                    <td className="py-2 pr-4 font-medium text-gray-900">{m.label}</td>
                    {measurementFields.map(({ key }) => (
                      <td key={key} className="py-2 pr-4 text-gray-600">
                        {m[key] != null ? `${m[key]}"` : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Orders</h2>
          <Link
            href={`/orders/new?customer=${id}`}
            className="text-sm text-indigo-600 font-medium hover:underline"
          >
            + New Order
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm">No orders for this customer yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const balance = (Number(order.price) || 0) - (Number(order.advance_paid) || 0);
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors group"
                >
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {order.garment_type}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      Rs. {Number(order.price).toLocaleString()}
                    </span>
                    {balance > 0 && (
                      <span className="text-xs text-red-600 font-medium">
                        Due: Rs. {balance.toLocaleString()}
                      </span>
                    )}
                    <StatusBadge status={order.status as OrderStatus} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
