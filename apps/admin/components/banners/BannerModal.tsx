"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import ImageUpload from "@/components/ImageUpload";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Banner, Branch, Category, Product } from "@dismart/shared";

const input = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10";
const select = `${input} cursor-pointer`;

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  branches: Branch[];
  categories: Category[];
  products: Product[];
  banner?: Banner;
}

export default function BannerModal({ open, onClose, onSaved, branches, categories, products, banner }: Props) {
  const editing = !!banner;
  const [form, setForm] = useState({
    branch_id: banner?.branch_id ?? "",
    headline: banner?.headline ?? "",
    subtext: banner?.subtext ?? "",
    image_url: banner?.image_url ?? "",
    link_type: banner?.link_type ?? "none" as Banner["link_type"],
    link_id: banner?.link_id ?? "",
    is_active: banner?.is_active ?? true,
    sort_order: String(banner?.sort_order ?? 1),
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      branch_id: banner?.branch_id ?? "",
      headline: banner?.headline ?? "",
      subtext: banner?.subtext ?? "",
      image_url: banner?.image_url ?? "",
      link_type: banner?.link_type ?? "none" as Banner["link_type"],
      link_id: banner?.link_id ?? "",
      is_active: banner?.is_active ?? true,
      sort_order: String(banner?.sort_order ?? 1),
    });
    setError(null);
  }, [open, banner]);

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createBrowserSupabaseClient()!;
    const payload = {
      branch_id: form.branch_id,
      headline: form.headline,
      subtext: form.subtext || null,
      image_url: form.image_url || null,
      link_type: form.link_type,
      link_id: form.link_id || null,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order),
    };

    const { error: err } = editing
      ? await supabase.from("banners").update(payload).eq("id", banner.id)
      : await supabase.from("banners").insert(payload);

    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false);
    onSaved();
  }

  const linkOptions = form.link_type === "category" ? categories : form.link_type === "product" ? products : [];

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Banner" : "New Banner"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Branch" htmlFor="ban-branch">
          <select id="ban-branch" className={select} required value={form.branch_id} onChange={(e) => set("branch_id", e.target.value)}>
            <option value="">Select branch…</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </FormField>

        <FormField label="Headline" htmlFor="ban-headline">
          <input id="ban-headline" className={input} placeholder="e.g. MASSIVE SAVINGS THIS WEEK" required value={form.headline} onChange={(e) => set("headline", e.target.value)} />
        </FormField>

        <FormField label="Subtext" htmlFor="ban-subtext" hint="Optional supporting line">
          <input id="ban-subtext" className={input} placeholder="e.g. New stock just landed." value={form.subtext} onChange={(e) => set("subtext", e.target.value)} />
        </FormField>

        <FormField label="Banner image" htmlFor="ban-image">
          <ImageUpload bucket="dismart" folder="banners" value={form.image_url} onChange={(url) => set("image_url", url)} label="Banner image" />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Link type" htmlFor="ban-link-type">
            <select id="ban-link-type" className={select} value={form.link_type} onChange={(e) => { set("link_type", e.target.value); set("link_id", ""); }}>
              <option value="none">No link</option>
              <option value="category">Category</option>
              <option value="product">Product</option>
            </select>
          </FormField>
          {form.link_type !== "none" && (
            <FormField label={form.link_type === "category" ? "Category" : "Product"} htmlFor="ban-link-id">
              <select id="ban-link-id" className={select} value={form.link_id} onChange={(e) => set("link_id", e.target.value)}>
                <option value="">Select…</option>
                {linkOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
          )}
        </div>

        <FormField label="Sort order" htmlFor="ban-order">
          <input id="ban-order" type="number" min="1" className={input} required value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
        </FormField>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div role="checkbox" aria-checked={form.is_active} onClick={() => set("is_active", !form.is_active)}
            className={`relative h-5 w-9 rounded-full transition ${form.is_active ? "bg-brand-navy" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700">Active (visible on public site)</span>
        </label>

        {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{error}</p>}

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-brand-navy py-2.5 text-sm font-bold text-white hover:bg-brand-navy/90 transition disabled:opacity-60">
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Banner"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
