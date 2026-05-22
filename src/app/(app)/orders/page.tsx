import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import type { OrderStatus } from "@/lib/types";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, customer:customers(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Link
          href="/orders/new"
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          + New Order
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-12 text-center">
          <p className="text-gray-500 text-lg">No orders yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first order to get started.</p>
          <Link
            href="/orders/new"
            className="mt-4 inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Order
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Garment</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Balance</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const customer = Array.isArray(order.customer)
                    ? order.customer[0]
                    : order.customer;
                  const balance =
                    (Number(order.price) || 0) - (Number(order.advance_paid) || 0);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <Link href={`/orders/${order.id}`} className="hover:text-indigo-600">
                          {customer?.name ?? "—"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.garment_type}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status as OrderStatus} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Rs. {Number(order.price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-red-600">
                        {balance > 0 ? `Rs. ${balance.toLocaleString()}` : "Paid"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.due_date
                          ? new Date(order.due_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
