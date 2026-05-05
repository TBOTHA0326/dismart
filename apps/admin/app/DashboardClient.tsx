"use client";

import { AlertTriangle, BadgePercent, Boxes, Building2 } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Table } from "@/components/Table";
import type { Profile } from "@dismart/shared";

interface Props {
  profile: Profile;
  productCount: number;
  specialCount: number;
  expiringCount: number;
  dealCount: number;
  banners: { id: string; headline: string; branch_id: string; is_active: boolean; sort_order: number }[];
  branches: { id: string; name: string }[];
}

export default function DashboardClient({ profile, productCount, specialCount, expiringCount, dealCount, banners, branches }: Props) {
  return (
    <AdminShell role={profile.role}>
      <PageHeader
        title="Dashboard"
        description="Branch-first operating overview for current products, specials and expiry-sensitive stock."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active products" value={productCount} detail="Across assigned branches" icon={Boxes} />
        <StatCard label="Specials" value={specialCount} detail="Live WhatsApp-led offers" icon={BadgePercent} />
        <StatCard label="Expiring soon" value={expiringCount} detail="Review before publishing" icon={AlertTriangle} />
        <StatCard label="Deals" value={dealCount} detail="Pamphlets and social links" icon={Building2} />
      </div>

      <section className="mt-8">
        <PageHeader
          title="Live Banners"
          description="Promotional cards currently eligible for the public home page."
        />
        <Table
          headers={["Headline", "Branch", "Status", "Order"]}
          rows={banners.map((banner) => [
            <span className="font-bold text-brand-navy" key="headline">{banner.headline}</span>,
            branches.find((b) => b.id === banner.branch_id)?.name ?? "Unknown",
            banner.is_active ? "Active" : "Paused",
            banner.sort_order,
          ])}
        />
      </section>
    </AdminShell>
  );
}
