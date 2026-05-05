"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Branch } from "@dismart/shared";

const input = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-base md:text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  branch?: Branch;
}

export default function BranchModal({ open, onClose, onSaved, branch }: Props) {
  const editing = !!branch;
  const [form, setForm] = useState({
    name: branch?.name ?? "",
    location: branch?.location ?? "",
    address: branch?.address ?? "",
    phone: branch?.phone ?? "",
    whatsapp_number: branch?.whatsapp_number ?? "",
    is_active: branch?.is_active ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: branch?.name ?? "",
      location: branch?.location ?? "",
      address: branch?.address ?? "",
      phone: branch?.phone ?? "",
      whatsapp_number: branch?.whatsapp_number ?? "",
      is_active: branch?.is_active ?? true,
    });
    setError(null);
  }, [open, branch]);

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createBrowserSupabaseClient()!;
    const { error: err } = editing
      ? await supabase.from("branches").update(form).eq("id", branch.id)
      : await supabase.from("branches").insert(form);

    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Branch" : "New Branch"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Branch name" htmlFor="br-name">
            <input id="br-name" className={input} placeholder="e.g. Meyerton" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </FormField>
          <FormField label="Location" htmlFor="br-location" hint="City / area label">
            <input id="br-location" className={input} placeholder="e.g. Meyerton" required value={form.location} onChange={(e) => set("location", e.target.value)} />
          </FormField>
        </div>

        <FormField label="Street address" htmlFor="br-address">
          <input id="br-address" className={input} placeholder="e.g. 12 Kerk Street, Meyerton, 1961" required value={form.address} onChange={(e) => set("address", e.target.value)} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Phone number" htmlFor="br-phone">
            <input id="br-phone" type="tel" className={input} placeholder="0161234567" required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </FormField>
          <FormField label="WhatsApp number" htmlFor="br-whatsapp" hint="Country code, no + or spaces">
            <input id="br-whatsapp" type="tel" className={input} placeholder="27821234567" required value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} />
          </FormField>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div role="checkbox" aria-checked={form.is_active} onClick={() => set("is_active", !form.is_active)}
            className={`relative h-5 w-9 rounded-full transition ${form.is_active ? "bg-brand-navy" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700">Branch is active</span>
        </label>

        {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{error}</p>}

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-brand-navy py-2.5 text-sm font-bold text-white hover:bg-brand-navy/90 transition disabled:opacity-60">
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Branch"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
