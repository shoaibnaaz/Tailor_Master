"use client";

import Link from "next/link";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

interface OrderRow {
  id: string;
  garment_type: string;
  status: string;
  price: number;
  advance_paid: number;
  due_date: string | null;
  created_at: string;
  customer: { name: string } | { name: string }[] | null;
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "cutting", label: "Cutting" },
  { value: "stitching", label: "Stitching" },
  { value: "finishing", label: "Finishing" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrderFilters({ orders }: { orders: OrderRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = orders.filter((order) => {
    const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer;
    const q = query.toLowerCase();
    const matchesSearch =
      !query ||
      (customer?.name ?? "").toLowerCase().includes(q) ||
      order.garment_type.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by customer or garment..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === "all" ? orders.length : orders.filter((o) => o.status === tab.value).length;
          if (count === 0 && tab.value !== "all") return null;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                statusFilter === tab.value ? "bg-indigo-200 text-indigo-800" : "bg-gray-100 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-12 text-center">
          <p className="text-gray-500">No orders match your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Garment</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Balance</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => {
                  const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer;
                  const balance = (Number(order.price) || 0) - (Number(order.advance_paid) || 0);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <Link href={`/orders/${order.id}`} className="hover:text-indigo-600 transition-colors">
                          {customer?.name ?? "—"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.garment_type}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status as OrderStatus} />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        Rs. {Number(order.price).toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                        {balance > 0 ? `Rs. ${balance.toLocaleString()}` : "Paid"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.due_date ? new Date(order.due_date).toLocaleDateString() : "—"}
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
