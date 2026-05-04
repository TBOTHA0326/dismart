import { Plus } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { branches, deals } from "@/lib/data";

export default function DealsPage() {
  return (
    <AdminShell>
      <PageHeader
        title="Deals"
        description="Upload or link savings pamphlets, PDFs, images and Facebook deal posts per branch."
        action={
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Deal
          </button>
        }
      />
      <Table
        headers={["Title", "Branch", "Asset", "Source", "Status", "Order"]}
        rows={deals.map((deal) => [
          <div key="title">
            <p className="font-bold text-brand-navy">{deal.title}</p>
            <p className="text-xs text-gray-500">{deal.description}</p>
          </div>,
          branches.find((branch) => branch.id === deal.branch_id)?.name ?? "Unknown",
          deal.asset_type,
          deal.source.replace("_", " "),
          deal.is_active ? "Active" : "Paused",
          deal.sort_order,
        ])}
      />
    </AdminShell>
  );
}
