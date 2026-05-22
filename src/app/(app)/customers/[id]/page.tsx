import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import DeleteCustomerButton from "./DeleteCustomerButton";
import MeasurementForm from "./MeasurementForm";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!customer) notFound();

  const [measurementsRes, ordersRes] = await Promise.all([
    supabase
      .from("measurements")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const measurements = measurementsRes.data ?? [];
  const orders = ordersRes.data ?? [];

  const measurementFields = [
    "chest", "waist", "hips", "shoulder", "sleeve_length",
    "inseam", "outseam", "neck", "back_length", "front_length",
  ] as const;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Customer Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/customers" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">
            &larr; Back to Customers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-500">{customer.phone}</p>
          {customer.email && <p className="text-gray-400 text-sm">{customer.email}</p>}
          {customer.address && <p className="text-gray-400 text-sm mt-1">{customer.address}</p>}
          {customer.notes && (
            <p className="text-gray-400 text-sm mt-2 italic">{customer.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/orders/new?customer=${id}`}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            + New Order
          </Link>
          <DeleteCustomerButton customerId={id} />
        </div>
      </div>

      {/* Measurements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Measurements</h2>
        </div>
        {measurements.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
                  <th className="px-4 py-3">Label</th>
                  {measurementFields.map((f) => (
                    <th key={f} className="px-4 py-3">
                      {f.replace("_", " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {measurements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{m.label}</td>
                    {measurementFields.map((f) => (
                      <td key={f} className="px-4 py-3 text-gray-600">
                        {m[f] != null ? `${m[f]}"` : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-4 border-t border-gray-200">
          <MeasurementForm customerId={id} />
        </div>
      </div>

      {/* Orders for this customer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Orders ({orders.length})</h2>
          <Link
            href={`/orders/new?customer=${id}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            + New Order
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No orders for this customer yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{order.garment_type}</p>
                    <p className="text-sm text-gray-500">
                      Rs. {Number(order.price).toLocaleString()} &middot; {order.status}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
