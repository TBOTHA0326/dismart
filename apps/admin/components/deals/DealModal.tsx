"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Branch, DealPamphlet } from "@dismart/shared";

const input = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-base md:text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10";
const select = `${input} cursor-pointer`;

const BUCKET = "deals";
const MAX_MB = 20;

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  branches: Branch[];
  deal?: DealPamphlet;
  nextSortOrder?: number;
}

export default function DealModal({ open, onClose, onSaved, branches, deal, nextSortOrder = 1 }: Props) {
  const editing = !!deal;
  const [form, setForm] = useState({
    branch_id: deal?.branch_id ?? "",
    title: deal?.title ?? "",
    description: deal?.description ?? "",
    asset_url: deal?.asset_url ?? "",
    asset_type: deal?.asset_type ?? "image" as DealPamphlet["asset_type"],
    starts_at: deal?.starts_at?.slice(0, 10) ?? "",
    ends_at: deal?.ends_at?.slice(0, 10) ?? "",
    is_active: deal?.is_active ?? true,
    sort_order: deal?.sort_order ?? nextSortOrder,
  });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      branch_id: deal?.branch_id ?? "",
      title: deal?.title ?? "",
      description: deal?.description ?? "",
      asset_url: deal?.asset_url ?? "",
      asset_type: deal?.asset_type ?? "image",
      starts_at: deal?.starts_at?.slice(0, 10) ?? "",
      ends_at: deal?.ends_at?.slice(0, 10) ?? "",
      is_active: deal?.is_active ?? true,
      sort_order: deal?.sort_order ?? nextSortOrder,
    });
    setError(null);
  }, [open, deal, nextSortOrder]);

  function set<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function upload(file: File) {
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) { setError("Only image files (PNG, JPG, WEBP) or PDF files are allowed."); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setError(`File must be under ${MAX_MB} MB.`); return; }

    setError(null);
    setUploading(true);

    const supabase = createBrowserSupabaseClient()!;
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    set("asset_url", data.publicUrl);
    set("asset_type", isPdf ? "pdf" : "image");
    setUploading(false);
  }

  function handleFiles(files: FileList | null) {
    if (files?.[0]) upload(files[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_url) { setError("Please upload a file."); return; }
    setError(null);
    setSaving(true);

    const supabase = createBrowserSupabaseClient()!;
    const payload = {
      branch_id: form.branch_id,
      title: form.title,
      description: form.description || null,
      asset_url: form.asset_url,
      asset_type: form.asset_type,
      source: "upload" as DealPamphlet["source"],
      is_active: form.is_active,
      sort_order: form.sort_order,
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

  const isPdf = form.asset_type === "pdf";
  const hasFile = !!form.asset_url;

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
          <textarea id="deal-desc" className={`${input} resize-none`} rows={2} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
        </FormField>

        <FormField label="File" htmlFor="deal-file" hint="Images (PNG, JPG, WEBP) or PDF — max 20 MB">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => !hasFile && inputRef.current?.click()}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition
              ${dragOver ? "border-brand-navy bg-brand-navy/5" : "border-gray-200 bg-gray-50 hover:border-brand-navy/50 hover:bg-gray-100"}
              ${hasFile ? "cursor-default" : ""}`}
          >
            {hasFile ? (
              isPdf ? (
                <div className="flex flex-col items-center gap-1">
                  <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-xs font-medium text-gray-600">PDF uploaded</p>
                  <a href={form.asset_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-navy underline" onClick={(e) => e.stopPropagation()}>Preview</a>
                </div>
              ) : (
                <img src={form.asset_url} alt="Deal" className="h-32 w-full rounded-lg object-cover" />
              )
            ) : (
              <>
                <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 10l-4-4-4 4M12 6v10" />
                </svg>
                <p className="text-xs font-medium text-gray-400">
                  {uploading ? "Uploading…" : "Drop file here or click to upload"}
                </p>
                <p className="text-[11px] text-gray-300">PNG, JPG, WEBP, PDF — max 20 MB</p>
              </>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
              </div>
            )}
          </div>

          {hasFile && (
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition">
                Replace
              </button>
              <button type="button" onClick={() => { set("asset_url", ""); set("asset_type", "image"); }}
                className="flex-1 rounded-lg border border-red-100 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition">
                Remove
              </button>
            </div>
          )}

          <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden"
            onChange={(e) => handleFiles(e.target.files)} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Starts" htmlFor="deal-starts" hint="Leave blank for immediate">
            <input id="deal-starts" type="date" className={input} value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} />
          </FormField>
          <FormField label="Ends" htmlFor="deal-ends" hint="Leave blank to run indefinitely">
            <input id="deal-ends" type="date" className={input} value={form.ends_at} onChange={(e) => set("ends_at", e.target.value)} />
          </FormField>
        </div>

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
          <button type="submit" disabled={saving || uploading} className="flex-1 rounded-xl bg-brand-navy py-2.5 text-sm font-bold text-white hover:bg-brand-navy/90 transition disabled:opacity-60">
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Deal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
