"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import ImageUpload from "@/components/ImageUpload";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Category } from "@dismart/shared";

const input = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  nextSortOrder: number;
  category?: Category;
}

export default function CategoryModal({ open, onClose, onSaved, nextSortOrder, category }: Props) {
  const editing = !!category;
  const [form, setForm] = useState({
    name: category?.name ?? "",
    icon_name: category?.icon_name ?? "",
    icon_url: category?.icon_url ?? "",
    sort_order: String(category?.sort_order ?? nextSortOrder),
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: category?.name ?? "",
      icon_name: category?.icon_name ?? "",
      icon_url: category?.icon_url ?? "",
      sort_order: String(category?.sort_order ?? nextSortOrder),
    });
    setError(null);
  }, [open, category, nextSortOrder]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createBrowserSupabaseClient()!;
    const payload = { name: form.name, icon_name: form.icon_name, icon_url: form.icon_url || null, sort_order: parseInt(form.sort_order) };

    const { error: err } = editing
      ? await supabase.from("categories").update(payload).eq("id", category.id)
      : await supabase.from("categories").insert(payload);

    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Category" : "New Category"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Category name" htmlFor="cat-name">
          <input id="cat-name" className={input} placeholder="e.g. Groceries" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </FormField>

        <FormField label="Icon name" htmlFor="cat-icon" hint="Lucide icon name, e.g. ShoppingBasket, Home, Sparkles">
          <input id="cat-icon" className={input} placeholder="e.g. ShoppingBasket" value={form.icon_name} onChange={(e) => set("icon_name", e.target.value)} />
        </FormField>

        <FormField label="Icon image" htmlFor="cat-icon-url" hint="Optional — upload a custom icon image instead of (or alongside) the Lucide icon">
          <ImageUpload bucket="dismart" folder="categories" value={form.icon_url} onChange={(url) => set("icon_url", url)} label="Category icon" />
        </FormField>

        <FormField label="Sort order" htmlFor="cat-order" hint="Lower numbers appear first in the category strip">
          <input id="cat-order" type="number" min="1" className={input} required value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
        </FormField>

        {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{error}</p>}

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-brand-navy py-2.5 text-sm font-bold text-white hover:bg-brand-navy/90 transition disabled:opacity-60">
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
