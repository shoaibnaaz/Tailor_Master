"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";

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
  const { toast } = useToast();
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

    toast("Measurement saved successfully");
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Measurement
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4 animate-slide-down">
      <h3 className="font-semibold text-gray-900">New Measurement</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <input
          id="label"
          name="label"
          defaultValue="Default"
          className="block w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-xs font-medium text-gray-500 mb-1">
              {field.label} (in)
            </label>
            <input
              id={field.name}
              name={field.name}
              type="number"
              step="0.25"
              className="block w-full rounded-xl border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <input
          id="notes"
          name="notes"
          placeholder="Any notes about this measurement..."
          className="block w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            "Save Measurement"
          )}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
