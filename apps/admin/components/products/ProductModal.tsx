"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import ImageUpload from "@/components/ImageUpload";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Branch, Category, Product } from "@dismart/shared";

const input = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-base md:text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10";
const select = `${input} cursor-pointer`;

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  branches: Branch[];
  categories: Category[];
  product?: Product;
}

export default function ProductModal({ open, onClose, onSaved, branches, categories, product }: Props) {
  const editing = !!product;
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    category_id: product?.category_id ?? "",
    image_url: product?.image_url ?? "",
    expiry_date: product?.expiry_date ?? "",
    is_special: product?.is_special ?? false,
    stock_status: product?.stock_status ?? "in_stock" as Product["stock_status"],
    stock_quantity: product ? String(product.stock_quantity) : "0",
    branch_ids: product?.branch_ids ?? [] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product ? String(product.price) : "",
      category_id: product?.category_id ?? "",
      image_url: product?.image_url ?? "",
      expiry_date: product?.expiry_date ?? "",
      is_special: product?.is_special ?? false,
      stock_status: product?.stock_status ?? "in_stock" as Product["stock_status"],
      stock_quantity: product ? String(product.stock_quantity) : "0",
      branch_ids: product?.branch_ids ?? [],
    });
    setError(null);
  }, [open, product]);

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleBranch(id: string) {
    setForm((prev) => ({
      ...prev,
      branch_ids: prev.branch_ids.includes(id)
        ? prev.branch_ids.filter((b) => b !== id)
        : [...prev.branch_ids, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createBrowserSupabaseClient()!;
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category_id: form.category_id,
      image_url: form.image_url || null,
      expiry_date: form.expiry_date || null,
      is_special: form.is_special,
      stock_status: form.stock_status,
      stock_quantity: Math.max(0, parseInt(form.stock_quantity, 10) || 0),
    };

    let productId = product?.id;

    if (editing) {
      const { error: err } = await supabase.from("products").update(payload).eq("id", product.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { data, error: err } = await supabase.from("products").insert(payload).select("id").single();
      if (err || !data) { setError(err?.message ?? "Failed to create product"); setSaving(false); return; }
      productId = data.id;
    }

    // Sync product_branches
    await supabase.from("product_branches").delete().eq("product_id", productId);
    if (form.branch_ids.length > 0) {
      const { error: branchErr } = await supabase.from("product_branches").insert(
        form.branch_ids.map((branch_id) => ({ product_id: productId, branch_id }))
      );
      if (branchErr) { setError(branchErr.message); setSaving(false); return; }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Product" : "New Product"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Product name" htmlFor="p-name">
          <input id="p-name" className={input} placeholder="e.g. Jungle Oats 1kg" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </FormField>

        <FormField label="Description" htmlFor="p-desc">
          <textarea id="p-desc" className={`${input} resize-none`} rows={2} placeholder="Short product description" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </FormField>

        <FormField label="Product image" htmlFor="p-image">
          <ImageUpload bucket="dismart" folder="products" value={form.image_url} onChange={(url) => set("image_url", url)} label="Product image" />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Price (ZAR)" htmlFor="p-price">
            <input id="p-price" type="number" min="0" step="0.01" className={input} placeholder="0.00" required value={form.price} onChange={(e) => set("price", e.target.value)} />
          </FormField>
          <FormField label="Category" htmlFor="p-cat">
            <select id="p-cat" className={select} required value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
              <option value="">Select…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Stock status" htmlFor="p-stock">
            <select id="p-stock" className={select} value={form.stock_status} onChange={(e) => set("stock_status", e.target.value)}>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </FormField>
          <FormField label="Expiry date" htmlFor="p-expiry" hint="Leave blank if no expiry">
            <input id="p-expiry" type="date" className={input} value={form.expiry_date ?? ""} onChange={(e) => set("expiry_date", e.target.value || null)} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Stock quantity" htmlFor="p-stock-qty" hint="Exact stock on hand before reservations">
            <input id="p-stock-qty" type="number" min="0" step="1" className={input} required value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} />
          </FormField>
          <FormField label="Reserved quantity" htmlFor="p-reserved-qty" hint="Calculated from active reservations">
            <input id="p-reserved-qty" type="number" className={input} value={product?.reserved_quantity ?? 0} disabled />
          </FormField>
        </div>

        <FormField label="Branches" htmlFor="p-branches">
          <div className="flex flex-wrap gap-2 pt-1">
            {branches.map((b) => {
              const active = form.branch_ids.includes(b.id);
              return (
                <button key={b.id} type="button" onClick={() => toggleBranch(b.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition ${active ? "border-brand-navy bg-brand-navy text-white" : "border-gray-200 bg-white text-gray-500 hover:border-brand-navy hover:text-brand-navy"}`}>
                  {b.name}
                </button>
              );
            })}
          </div>
        </FormField>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div role="checkbox" aria-checked={form.is_special} onClick={() => set("is_special", !form.is_special)}
            className={`relative h-5 w-9 rounded-full transition ${form.is_special ? "bg-brand-navy" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_special ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700">Mark as Special</span>
        </label>

        {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{error}</p>}

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-brand-navy py-2.5 text-sm font-bold text-white hover:bg-brand-navy/90 transition disabled:opacity-60">
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
