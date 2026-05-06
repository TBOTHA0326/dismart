"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BadgePercent,
  Boxes,
  Building2,
  ChevronRight,
  ClipboardList,
  FileText,
  ImageIcon,
  PackageX,
  Tags,
  Users,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";
import type { Profile } from "@dismart/shared";

interface BranchStat {
  id: string;
  name: string;
  is_active: boolean;
  productCount: number;
}

interface Props {
  profile: Profile;
  branches: { id: string; name: string }[];
  activeBranchId: string | null;
  productCount: number;
  specialCount: number;
  expiringCount: number;
  outOfStockCount: number;
  dealCount: number;
  activeDealCount: number;
  categoryCount: number;
  pendingReservations: number;
  todayReservations: number;
  totalReservations: number;
  activeBannerCount: number;
  banners: { id: string; headline: string; branch_id: string; is_active: boolean; sort_order: number }[];
  branchStats: BranchStat[];
}

export default function DashboardClient({
  profile,
  branches,
  activeBranchId,
  productCount,
  specialCount,
  expiringCount,
  outOfStockCount,
  dealCount,
  activeDealCount,
  categoryCount,
  pendingReservations,
  todayReservations,
  totalReservations,
  activeBannerCount,
  banners,
  branchStats,
}: Props) {
  const activeBranches = branchStats.filter((b) => b.is_active);

  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-brand-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {profile.full_name}. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 auto-rows-auto">

        {/* Products — wide card */}
        <div className="md:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Products</p>
              <p className="mt-1 text-4xl font-black text-brand-navy">{productCount}</p>
              <p className="mt-1 text-sm text-gray-500">Total in catalogue</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow/20 text-brand-navy">
              <Boxes className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-brand-yellow/10 px-3 py-2 text-center">
              <p className="text-xl font-black text-brand-navy">{specialCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Specials</p>
            </div>
            <div className={`rounded-lg px-3 py-2 text-center ${expiringCount > 0 ? "bg-orange-50" : "bg-gray-50"}`}>
              <p className={`text-xl font-black ${expiringCount > 0 ? "text-orange-600" : "text-brand-navy"}`}>{expiringCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Expiring 7d</p>
            </div>
            <div className={`rounded-lg px-3 py-2 text-center ${outOfStockCount > 0 ? "bg-red-50" : "bg-gray-50"}`}>
              <p className={`text-xl font-black ${outOfStockCount > 0 ? "text-red-600" : "text-brand-navy"}`}>{outOfStockCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Out of Stock</p>
            </div>
          </div>
          <Link href="/products" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:underline">
            Manage products <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Reservations card */}
        <div className={`rounded-xl border p-5 shadow-sm ${pendingReservations > 0 ? "border-brand-yellow/40 bg-brand-yellow/5" : "border-gray-100 bg-white"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Reservations</p>
              <p className={`mt-1 text-4xl font-black ${pendingReservations > 0 ? "text-brand-navy" : "text-brand-navy"}`}>{pendingReservations}</p>
              <p className="mt-1 text-sm text-gray-500">Pending action</p>
            </div>
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${pendingReservations > 0 ? "bg-brand-yellow/30 text-brand-navy" : "bg-brand-yellow/20 text-brand-navy"}`}>
              <ClipboardList className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
              <p className="text-xl font-black text-brand-navy">{todayReservations}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Today</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
              <p className="text-xl font-black text-brand-navy">{totalReservations}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">All time</p>
            </div>
          </div>
          <Link href="/reservations" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:underline">
            View reservations <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Alerts card */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Alerts</p>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </div>
          <ul className="space-y-2">
            {expiringCount > 0 ? (
              <li className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2">
                <span className="text-xs font-bold text-orange-700">Expiring within 7 days</span>
                <span className="text-sm font-black text-orange-700">{expiringCount}</span>
              </li>
            ) : (
              <li className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                <span className="text-xs font-bold text-green-700">No expiry alerts</span>
                <span className="text-sm font-black text-green-700">✓</span>
              </li>
            )}
            {outOfStockCount > 0 ? (
              <li className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                <span className="text-xs font-bold text-red-700">Out of stock</span>
                <span className="text-sm font-black text-red-700">{outOfStockCount}</span>
              </li>
            ) : (
              <li className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                <span className="text-xs font-bold text-green-700">All in stock</span>
                <span className="text-sm font-black text-green-700">✓</span>
              </li>
            )}
            {pendingReservations > 0 ? (
              <li className="flex items-center justify-between rounded-lg bg-brand-yellow/15 px-3 py-2">
                <span className="text-xs font-bold text-brand-navy">Reservations pending</span>
                <span className="text-sm font-black text-brand-navy">{pendingReservations}</span>
              </li>
            ) : null}
            {expiringCount === 0 && outOfStockCount === 0 && pendingReservations === 0 && (
              <li className="rounded-lg bg-green-50 px-3 py-2 text-center">
                <p className="text-xs font-bold text-green-700">Everything looks good</p>
              </li>
            )}
          </ul>
        </div>

        {/* Branch Health */}
        <div className="md:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Branch Health</p>
              <p className="mt-0.5 text-sm text-gray-500">{activeBranches.length} active branch{activeBranches.length !== 1 ? "es" : ""}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow/20 text-brand-navy">
              <Building2 className="h-5 w-5" />
            </span>
          </div>
          <div className="space-y-2">
            {branchStats.map((branch) => (
              <div key={branch.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${branch.is_active ? "bg-green-400" : "bg-gray-300"}`} />
                  <span className="text-sm font-bold text-brand-navy">{branch.name}</span>
                  {!branch.is_active && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-400">Inactive</span>
                  )}
                </div>
                <span className="text-sm font-black text-brand-navy">{branch.productCount} <span className="text-xs font-normal text-gray-400">products</span></span>
              </div>
            ))}
          </div>
          {profile.role === "super_admin" && (
            <Link href="/branches" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:underline">
              Manage branches <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Content overview */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Content</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <Tags className="h-3.5 w-3.5 text-brand-navy" />
                Categories
              </div>
              <span className="text-sm font-black text-brand-navy">{categoryCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <ImageIcon className="h-3.5 w-3.5 text-brand-navy" />
                Active banners
              </div>
              <span className="text-sm font-black text-brand-navy">{activeBannerCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <FileText className="h-3.5 w-3.5 text-brand-navy" />
                Active deals
              </div>
              <span className="text-sm font-black text-brand-navy">{activeDealCount} / {dealCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <BadgePercent className="h-3.5 w-3.5 text-brand-navy" />
                Specials live
              </div>
              <span className="text-sm font-black text-brand-navy">{specialCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <PackageX className="h-3.5 w-3.5 text-brand-navy" />
                Out of stock
              </div>
              <span className={`text-sm font-black ${outOfStockCount > 0 ? "text-red-600" : "text-brand-navy"}`}>{outOfStockCount}</span>
            </div>
          </div>
        </div>

        {/* Live Banners preview */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Live Banners</p>
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">{activeBannerCount} active</span>
          </div>
          {banners.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No active banners</p>
          ) : (
            <ul className="space-y-2">
              {banners.map((banner) => (
                <li key={banner.id} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                  <p className="flex-1 truncate text-sm font-bold text-brand-navy">{banner.headline}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/banners" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:underline">
            Manage banners <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Quick links */}
        <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
            {[
              { href: "/products", label: "Products", icon: Boxes },
              { href: "/categories", label: "Categories", icon: Tags },
              { href: "/banners", label: "Banners", icon: ImageIcon },
              { href: "/deals", label: "Deals", icon: FileText },
              { href: "/reservations", label: "Reservations", icon: ClipboardList },
              ...(profile.role === "super_admin"
                ? [
                    { href: "/branches", label: "Branches", icon: Building2 },
                    { href: "/users", label: "Users", icon: Users },
                  ]
                : []),
            ].slice(0, 6).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-lg border border-gray-100 px-3 py-3 text-sm font-bold text-brand-navy transition hover:border-brand-yellow hover:bg-brand-yellow/5"
              >
                <Icon className="h-4 w-4 shrink-0 text-brand-navy" />
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </AdminShell>
  );
}
