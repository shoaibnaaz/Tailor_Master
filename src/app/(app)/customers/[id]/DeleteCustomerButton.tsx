"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm("Delete this customer and all their measurements/orders?")) return;

    await supabase.from("customers").delete().eq("id", customerId);
    router.push("/customers");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
    >
      Delete
    </button>
  );
}
