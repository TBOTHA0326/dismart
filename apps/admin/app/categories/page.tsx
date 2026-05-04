import { ArrowDownUp, Plus } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { categories } from "@/lib/data";

export default function CategoriesPage() {
  return (
    <AdminShell>
      <PageHeader
        title="Categories"
        description="Manage the public category strip, icon names and display order."
        action={
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Category
          </button>
        }
      />
      <Table
        headers={["Name", "Icon", "Sort Order", "Reorder"]}
        rows={categories
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((category) => [
            <span className="font-bold text-brand-navy" key="name">{category.name}</span>,
            category.icon_name,
            category.sort_order,
            <button key="reorder" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-brand-navy">
              <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Reorder {category.name}</span>
            </button>,
          ])}
      />
    </AdminShell>
  );
}
