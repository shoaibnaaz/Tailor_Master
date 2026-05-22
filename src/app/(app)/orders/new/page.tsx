"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { GARMENT_TYPES } from "@/lib/types";
import type { Customer, Measurement } from "@/lib/types";

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const preselectedCustomerId = searchParams.get("customer");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState(preselectedCustomerId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      const { data } = await supabase
        .from("customers")
        .select("*")
        .order("name");
      setCustomers(data ?? []);
    }
    loadCustomers();
  }, [supabase]);

  useEffect(() => {
    if (!selectedCustomer) return;
    async function loadMeasurements() {
      const { data } = await supabase
        .from("measurements")
        .select("*")
        .eq("customer_id", selectedCustomer)
        .order("created_at", { ascending: false });
      setMeasurements(data ?? []);
    }
    loadMeasurements();
  }, [selectedCustomer, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    const measurementId = formData.get("measurement_id") as string;

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      customer_id: formData.get("customer_id") as string,
      measurement_id: measurementId || null,
      garment_type: formData.get("garment_type") as string,
      description: (formData.get("description") as string) || null,
      fabric: (formData.get("fabric") as string) || null,
      price: parseFloat(formData.get("price") as string) || 0,
      advance_paid: parseFloat(formData.get("advance_paid") as string) || 0,
      due_date: (formData.get("due_date") as string) || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/orders");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Order</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
            Customer *
          </label>
          <select
            id="customer_id"
            name="customer_id"
            required
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.phone}
              </option>
            ))}
          </select>
        </div>

        {measurements.length > 0 && (
          <div>
            <label htmlFor="measurement_id" className="block text-sm font-medium text-gray-700">
              Measurement
            </label>
            <select
              id="measurement_id"
              name="measurement_id"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">None</option>
              {measurements.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                  {m.chest ? ` — Chest: ${m.chest}"` : ""}
                  {m.waist ? ` Waist: ${m.waist}"` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="garment_type" className="block text-sm font-medium text-gray-700">
            Garment Type *
          </label>
          <select
            id="garment_type"
            name="garment_type"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {GARMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description / Special Instructions
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="fabric" className="block text-sm font-medium text-gray-700">
            Fabric
          </label>
          <input
            id="fabric"
            name="fabric"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (Rs.) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min="0"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="advance_paid" className="block text-sm font-medium text-gray-700">
              Advance Paid (Rs.)
            </label>
            <input
              id="advance_paid"
              name="advance_paid"
              type="number"
              min="0"
              defaultValue="0"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Order"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto"><p className="text-gray-500">Loading...</p></div>}>
      <NewOrderForm />
    </Suspense>
  );
}
