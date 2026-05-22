import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <Link
          href="/customers/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Add Customer
        </Link>
      </div>

      {!customers || customers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-12 text-center">
          <p className="text-gray-500 text-lg">No customers yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first customer to get started.</p>
          <Link
            href="/customers/new"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Customer
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{customer.phone}</p>
              {customer.email && (
                <p className="text-sm text-gray-400 mt-0.5">{customer.email}</p>
              )}
              {customer.address && (
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">{customer.address}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
