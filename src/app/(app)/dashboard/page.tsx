import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import type { OrderStatus } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [customersRes, ordersRes, recentOrdersRes] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id, status, price, advance_paid"),
    supabase
      .from("orders")
      .select("id, garment_type, status, price, due_date, created_at, customer:customers(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalCustomers = customersRes.count ?? 0;
  const orders = ordersRes.data ?? [];
  const recentOrders = recentOrdersRes.data ?? [];

  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  ).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  const pendingPayments = orders.reduce(
    (sum, o) => sum + ((Number(o.price) || 0) - (Number(o.advance_paid) || 0)),
    0
  );

  const stats = [
    { label: "Customers", value: totalCustomers, href: "/customers", color: "bg-blue-500" },
    { label: "Active Orders", value: activeOrders, href: "/orders", color: "bg-orange-500" },
    { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, href: "/orders", color: "bg-green-500" },
    { label: "Pending Payments", value: `Rs. ${pendingPayments.toLocaleString()}`, href: "/orders", color: "bg-red-500" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/customers/new"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Customer
          </Link>
          <Link
            href="/orders/new"
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            + Order
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} mb-3`} />
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/orders" className="text-sm text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No orders yet. Create your first order to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Garment</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => {
                  const customer = Array.isArray(order.customer)
                    ? order.customer[0]
                    : order.customer;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {customer?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.garment_type}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status as OrderStatus} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Rs. {Number(order.price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.due_date
                          ? new Date(order.due_date).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
