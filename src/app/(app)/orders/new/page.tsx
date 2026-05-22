"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { GARMENT_TYPES } from "@/lib/types";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import type { Customer, Measurement } from "@/lib/types";

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { toast } = useToast();

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

    toast("Order created successfully");
    router.push("/orders");
    router.refresh();
  }

  const inputClass = "block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Orders
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Order</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2 animate-slide-down">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-1">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            id="customer_id"
            name="customer_id"
            required
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className={inputClass}
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
            <label htmlFor="measurement_id" className="block text-sm font-medium text-gray-700 mb-1">
              Measurement
            </label>
            <select id="measurement_id" name="measurement_id" className={inputClass}>
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
          <label htmlFor="garment_type" className="block text-sm font-medium text-gray-700 mb-1">
            Garment Type <span className="text-red-500">*</span>
          </label>
          <select id="garment_type" name="garment_type" required className={inputClass}>
            {GARMENT_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description / Special Instructions
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Any special instructions..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="fabric" className="block text-sm font-medium text-gray-700 mb-1">
            Fabric
          </label>
          <input
            id="fabric"
            name="fabric"
            placeholder="e.g. Cotton, Silk, Wool"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (Rs.) <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min="0"
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="advance_paid" className="block text-sm font-medium text-gray-700 mb-1">
              Advance Paid (Rs.)
            </label>
            <input
              id="advance_paid"
              name="advance_paid"
              type="number"
              min="0"
              defaultValue="0"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            className={inputClass}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </>
            ) : (
              "Create Order"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
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
    <Suspense fallback={
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <NewOrderForm />
    </Suspense>
  );
}
