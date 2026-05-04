import { Plus } from "lucide-react";
import { formatCurrency } from "@dismart/shared";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { branches, categories, products } from "@/lib/data";

export default function ProductsPage() {
  return (
    <AdminShell>
      <PageHeader
        title="Products"
        description="Create and maintain products with branch assignment, stock status, specials and expiry dates."
        action={
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Product
          </button>
        }
      />
      <Table
        headers={["Product", "Category", "Price", "Branches", "Stock", "Special"]}
        rows={products.map((product) => [
          <div key="product">
            <p className="font-bold text-brand-navy">{product.name}</p>
            <p className="text-xs text-gray-500">{product.description}</p>
          </div>,
          categories.find((category) => category.id === product.category_id)?.name ?? "Unassigned",
          formatCurrency(product.price),
          product.branch_ids
            .map((id) => branches.find((branch) => branch.id === id)?.name)
            .filter(Boolean)
            .join(", "),
          product.stock_status.replaceAll("_", " "),
          product.is_special ? "Yes" : "No",
        ])}
      />
    </AdminShell>
  );
}
