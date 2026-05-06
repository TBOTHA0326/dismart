"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BadgePercent,
  Boxes,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ClipboardList,
  Tags,
  Users,
  X,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Profile } from "@dismart/shared";

const allNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin", "branch_manager"] },
  { href: "/products", label: "Products", icon: Boxes, roles: ["super_admin", "admin", "branch_manager"] },
  { href: "/reservations", label: "Reservations", icon: ClipboardList, roles: ["super_admin", "admin", "branch_manager"] },
  { href: "/categories", label: "Categories", icon: Tags, roles: ["super_admin", "admin", "branch_manager"] },
  { href: "/banners", label: "Banners", icon: BadgePercent, roles: ["super_admin", "admin", "branch_manager"] },
  { href: "/deals", label: "Deals", icon: FileText, roles: ["super_admin", "admin", "branch_manager"] },
  { href: "/branches", label: "Branches", icon: Building2, roles: ["super_admin"] },
  { href: "/users", label: "Users", icon: Users, roles: ["super_admin"] },
];

interface Props {
  children: React.ReactNode;
  role?: Profile["role"];
  branches?: { id: string; name: string }[];
  activeBranchId?: string | null;
}

export default function AdminShell({
  children,
  role = "branch_manager",
  branches = [],
  activeBranchId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      setLoading(false);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  const searchParams = useSearchParams();
  const branchParam = searchParams.get("branch");

  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  function navHref(href: string) {
    if (!branchParam) return href;
    return `${href}?branch=${branchParam}`;
  }

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function handleNavClick() {
    setLoading(true);
    setMobileNavOpen(false);
  }

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="fixed top-0 left-0 z-50 h-0.5 w-full overflow-hidden bg-transparent">
          <div className="h-full animate-progress-bar bg-brand-navy" />
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-2xl font-black tracking-tight">
            <span className="text-brand-navy">DIS</span>
            <span className="text-brand-red">MART</span>
            <span className="ml-2 text-sm font-bold text-gray-400">CMS</span>
          </Link>
          <div className="flex items-center gap-2">
            {(role === "super_admin" || role === "admin") && branches.length > 0 && (
              <BranchSelector branches={branches} activeBranchId={activeBranchId ?? null} />
            )}
            <button
              onClick={handleSignOut}
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-navy transition"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
            <button
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-brand-navy md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

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
        <nav className="flex flex-col h-[calc(100%-4rem)] p-3">
          <div className="space-y-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={navHref(item.href)}
                onClick={handleNavClick}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition
                  ${isActive(item.href)
                    ? "bg-brand-navy/5 text-brand-navy"
                    : "text-gray-600 hover:bg-gray-50 hover:text-brand-navy"}`}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </div>
          <button
            onClick={handleSignOut}
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-brand-navy transition"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </nav>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={navHref(item.href)}
                onClick={handleNavClick}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition
                  ${isActive(item.href)
                    ? "bg-white text-brand-navy shadow-sm"
                    : "text-gray-600 hover:bg-white hover:text-brand-navy hover:shadow-sm"}`}
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

function BranchSelector({
  branches,
  activeBranchId,
}: {
  branches: { id: string; name: string }[];
  activeBranchId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("branch", value);
    } else {
      params.delete("branch");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <select
      value={activeBranchId ?? ""}
      onChange={handleChange}
      className="h-9 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-brand-navy outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
      aria-label="Select branch"
    >
      <option value="">All Branches</option>
      {branches.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
