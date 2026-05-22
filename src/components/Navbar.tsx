"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-client";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/orders", label: "Orders" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            ✂️ Tailor Master
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-indigo-900"
                    : "hover:bg-indigo-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-indigo-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-indigo-600">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname.startsWith(link.href)
                    ? "bg-indigo-900"
                    : "hover:bg-indigo-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
