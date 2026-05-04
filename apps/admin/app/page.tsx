import { AlertTriangle, BadgePercent, Boxes, Building2 } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Table } from "@/components/Table";
import { banners, branches, deals, products } from "@/lib/data";

export default function DashboardPage() {
  const expiringSoon = products.filter((product) => product.expiry_date).length;
  const specials = products.filter((product) => product.is_special).length;

  return (
    <AdminShell>
      <PageHeader
        title="Dashboard"
        description="Branch-first operating overview for current products, specials and expiry-sensitive stock."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active products" value={products.length} detail="Across assigned branches" icon={Boxes} />
        <StatCard label="Specials" value={specials} detail="Live WhatsApp-led offers" icon={BadgePercent} />
        <StatCard label="Expiring soon" value={expiringSoon} detail="Review before publishing" icon={AlertTriangle} />
        <StatCard label="Deals" value={deals.length} detail="Pamphlets and social links" icon={Building2} />
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
            branches.find((branch) => branch.id === banner.branch_id)?.name ?? "Unknown",
            banner.is_active ? "Active" : "Paused",
            banner.sort_order,
          ])}
        />
      </section>
    </AdminShell>
  );
}
