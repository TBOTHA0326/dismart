"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Branch, DealPamphlet } from "@dismart/shared";

const input = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10";
const select = `${input} cursor-pointer`;

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  branches: Branch[];
  deal?: DealPamphlet;
}

export default function DealModal({ open, onClose, onSaved, branches, deal }: Props) {
  const editing = !!deal;
  const [form, setForm] = useState({
    branch_id: deal?.branch_id ?? "",
    title: deal?.title ?? "",
    description: deal?.description ?? "",
    source: deal?.source ?? "image_url" as DealPamphlet["source"],
    asset_url: deal?.asset_url ?? "",
    starts_at: deal?.starts_at?.slice(0, 10) ?? "",
    ends_at: deal?.ends_at?.slice(0, 10) ?? "",
    is_active: deal?.is_active ?? true,
    sort_order: String(deal?.sort_order ?? 1),
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      branch_id: deal?.branch_id ?? "",
      title: deal?.title ?? "",
      description: deal?.description ?? "",
      source: deal?.source ?? "image_url" as DealPamphlet["source"],
      asset_url: deal?.asset_url ?? "",
      starts_at: deal?.starts_at?.slice(0, 10) ?? "",
      ends_at: deal?.ends_at?.slice(0, 10) ?? "",
      is_active: deal?.is_active ?? true,
      sort_order: String(deal?.sort_order ?? 1),
    });
    setError(null);
  }, [open, deal]);

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
      title: form.title,
      description: form.description || null,
      source: form.source,
      asset_url: form.asset_url,
      asset_type: "image" as DealPamphlet["asset_type"],
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order),
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    };

    const { error: err } = editing
      ? await supabase.from("deal_pamphlets").update(payload).eq("id", deal.id)
      : await supabase.from("deal_pamphlets").insert(payload);

    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Deal" : "New Deal"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Branch" htmlFor="deal-branch">
          <select id="deal-branch" className={select} required value={form.branch_id} onChange={(e) => set("branch_id", e.target.value)}>
            <option value="">Select branch…</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </FormField>

        <FormField label="Title" htmlFor="deal-title">
          <input id="deal-title" className={input} placeholder="e.g. Weekly Savings Pamphlet" required value={form.title} onChange={(e) => set("title", e.target.value)} />
        </FormField>

        <FormField label="Description" htmlFor="deal-desc" hint="Optional">
          <textarea id="deal-desc" className={`${input} resize-none`} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </FormField>

        <FormField label="Source type" htmlFor="deal-source">
          <select id="deal-source" className={select} value={form.source} onChange={(e) => { set("source", e.target.value); set("asset_url", ""); }}>
            <option value="image_url">Image URL</option>
            <option value="facebook_url">Facebook URL</option>
            <option value="other_url">Other URL</option>
          </select>
        </FormField>

        <FormField label="URL" htmlFor="deal-url">
          <input id="deal-url" type="url" className={input} placeholder="https://…" required value={form.asset_url} onChange={(e) => set("asset_url", e.target.value)} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Starts" htmlFor="deal-starts" hint="Leave blank for immediate">
            <input id="deal-starts" type="date" className={input} value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} />
          </FormField>
          <FormField label="Ends" htmlFor="deal-ends" hint="Leave blank to run indefinitely">
            <input id="deal-ends" type="date" className={input} value={form.ends_at} onChange={(e) => set("ends_at", e.target.value)} />
          </FormField>
        </div>

        <FormField label="Sort order" htmlFor="deal-order">
          <input id="deal-order" type="number" min="1" className={input} required value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
        </FormField>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div role="checkbox" aria-checked={form.is_active} onClick={() => set("is_active", !form.is_active)}
            className={`relative h-5 w-9 rounded-full transition ${form.is_active ? "bg-brand-navy" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700">Active</span>
        </label>

        {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{error}</p>}

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-brand-navy py-2.5 text-sm font-bold text-white hover:bg-brand-navy/90 transition disabled:opacity-60">
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Deal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
