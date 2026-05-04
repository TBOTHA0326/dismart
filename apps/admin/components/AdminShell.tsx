"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgePercent,
  Boxes,
  Building2,
  FileText,
  LayoutDashboard,
  Menu,
  Tags,
  Users,
  X,
} from "lucide-react";
import { profiles } from "@/lib/data";

// Temporary: simulate active user role from mock data
// Replace with real session check when Supabase Auth is connected
const activeProfile = profiles[0];
const isBranchManager = activeProfile.role === "branch_manager";

// `hiddenFromBranchManager` flags items branch managers should not see.
// Both admin and super_admin see all items.
// When real auth is wired, move this filtering inside the component using a session hook.
const allNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/banners", label: "Banners", icon: BadgePercent },
  { href: "/deals", label: "Deals", icon: FileText },
  { href: "/branches", label: "Branches", icon: Building2, hiddenFromBranchManager: true },
  { href: "/users", label: "Users", icon: Users },
];

const navItems = isBranchManager
  ? allNavItems.filter((item) => !item.hiddenFromBranchManager)
  : allNavItems;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-2xl font-black tracking-tight">
            <span className="text-brand-navy">DIS</span>
            <span className="text-brand-red">MART</span>
            <span className="ml-2 text-sm font-bold text-gray-400">CMS</span>
          </Link>
          <button
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-brand-navy md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-200 md:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-brand-navy">DIS</span>
            <span className="text-brand-red">MART</span>
            <span className="ml-2 text-sm font-bold text-gray-400">CMS</span>
          </span>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-brand-navy"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-brand-navy"
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-gray-600 transition hover:bg-white hover:text-brand-navy hover:shadow-sm"
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
