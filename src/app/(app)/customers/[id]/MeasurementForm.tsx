"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-client";

const FIELDS = [
  { name: "chest", label: "Chest" },
  { name: "waist", label: "Waist" },
  { name: "hips", label: "Hips" },
  { name: "shoulder", label: "Shoulder" },
  { name: "sleeve_length", label: "Sleeve Length" },
  { name: "inseam", label: "Inseam" },
  { name: "outseam", label: "Outseam" },
  { name: "neck", label: "Neck" },
  { name: "back_length", label: "Back Length" },
  { name: "front_length", label: "Front Length" },
] as const;

export default function MeasurementForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string | number | null> = {
      customer_id: customerId,
      label: (formData.get("label") as string) || "Default",
      notes: (formData.get("notes") as string) || null,
    };

    for (const field of FIELDS) {
      const val = formData.get(field.name) as string;
      data[field.name] = val ? parseFloat(val) : null;
    }

    const { error } = await supabase.from("measurements").insert(data);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-indigo-600 font-medium hover:underline"
      >
        + Add Measurement
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-gray-900">New Measurement</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="label" className="block text-sm font-medium text-gray-700">
          Label
        </label>
        <input
          id="label"
          name="label"
          defaultValue="Default"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-xs font-medium text-gray-500">
              {field.label} (in)
            </label>
            <input
              id={field.name}
              name={field.name}
              type="number"
              step="0.25"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <input
          id="notes"
          name="notes"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Measurement"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
