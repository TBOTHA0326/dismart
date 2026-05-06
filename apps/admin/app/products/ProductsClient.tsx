"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { formatCurrency, getAvailableStock } from "@dismart/shared";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import ProductModal from "@/components/products/ProductModal";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Branch, Category, Product, Profile } from "@dismart/shared";

interface Props {
  profile: Profile;
  initialProducts: Product[];
  categories: Category[];
  branches: Branch[];
  activeBranchId: string | null;
}

export default function ProductsClient({ profile, initialProducts, categories, branches, activeBranchId }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();

  function openNew() { setEditing(undefined); setModalOpen(true); }
  function openEdit(p: Product) { setEditing(p); setModalOpen(true); }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const supabase = createBrowserSupabaseClient();
    await supabase?.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleDeleteSelected(ids: string[]) {
    const supabase = createBrowserSupabaseClient();
    await supabase?.from("products").delete().in("id", ids);
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
  }

  async function handleSaved() {
    const supabase = createBrowserSupabaseClient();
    const query = activeBranchId
      ? supabase!.from("products").select("*, product_branches!inner(branch_id)").eq("product_branches.branch_id", activeBranchId).order("created_at", { ascending: false })
      : supabase!.from("products").select("*, product_branches(branch_id)").order("created_at", { ascending: false });
    const { data } = await query;
    if (data) {
      setProducts(data.map((p: any) => ({ ...p, branch_ids: (p.product_branches ?? []).map((pb: any) => pb.branch_id) })));
    }
    setModalOpen(false);
  }

  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
      <PageHeader
        title="Products"
        description="Create and maintain products with branch assignment, exact stock, reservations, specials and expiry dates."
        action={
          <button onClick={openNew} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white hover:bg-red-700 transition active:scale-[0.98]">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Product
          </button>
        }
      />

      <Table
        headers={["Product", "Category", "Price", "Branches", "Stock", "Reserved", "Special", ""]}
        searchable={products.map((p) => p.name)}
        rowIds={products.map((p) => p.id)}
        onDeleteSelected={handleDeleteSelected}
        rows={products.map((product) => [
          <div key="product">
            <p className="font-bold text-brand-navy">{product.name}</p>
            <p className="text-xs text-gray-500">{product.description}</p>
          </div>,
          categories.find((c) => c.id === product.category_id)?.name ?? "Unassigned",
          formatCurrency(product.price),
          product.branch_ids
            .map((id) => branches.find((b) => b.id === id)?.name)
            .filter(Boolean)
            .join(", "),
          <span key="stock" className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
            product.stock_status === "in_stock" ? "bg-green-50 text-green-700"
            : product.stock_status === "low_stock" ? "bg-yellow-50 text-yellow-700"
            : "bg-red-50 text-red-700"
          }`}>
            {getAvailableStock(product)} / {product.stock_quantity}
          </span>,
          <span key="reserved" className="text-sm font-bold text-brand-navy">
            {product.reserved_quantity}
          </span>,
          product.is_special
            ? <span key="special" className="inline-flex rounded-full bg-brand-yellow/20 px-2 py-0.5 text-xs font-bold text-brand-navy">Special</span>
            : <span key="special" className="text-gray-300 text-xs">—</span>,
          <div key="actions" className="flex items-center gap-2">
            <button onClick={() => openEdit(product)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition" aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => handleDelete(product.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition" aria-label="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>,
        ])}
      />

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        branches={branches}
        categories={categories}
        product={editing}
        lockedBranchId={profile.role === "branch_manager" ? activeBranchId : null}
      />
    </AdminShell>
  );
}
