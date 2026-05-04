import { Plus } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { banners, branches } from "@/lib/data";

export default function BannersPage() {
  return (
    <AdminShell>
      <PageHeader
        title="Banners"
        description="Control branch-specific promotional cards shown on the public home page."
        action={
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Banner
          </button>
        }
      />
      <Table
        headers={["Headline", "Branch", "Link", "Status", "Order"]}
        rows={banners.map((banner) => [
          <div key="headline">
            <p className="font-bold text-brand-navy">{banner.headline}</p>
            <p className="text-xs text-gray-500">{banner.subtext}</p>
          </div>,
          branches.find((branch) => branch.id === banner.branch_id)?.name ?? "Unknown",
          banner.link_type,
          banner.is_active ? "Active" : "Paused",
          banner.sort_order,
        ])}
      />
    </AdminShell>
  );
}
