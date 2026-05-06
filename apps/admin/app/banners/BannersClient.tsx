"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import BannerModal from "@/components/banners/BannerModal";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Banner, Branch, Category, Product, Profile } from "@dismart/shared";

interface Props {
  profile: Profile;
  initialBanners: Banner[];
  branches: Branch[];
  categories: Pick<Category, "id" | "name">[];
  products: Pick<Product, "id" | "name">[];
  activeBranchId: string | null;
}

export default function BannersClient({ profile, initialBanners, branches, categories, products, activeBranchId }: Props) {
  const [banners, setBanners] = useState(initialBanners);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | undefined>();

  function openNew() { setEditing(undefined); setModalOpen(true); }
  function openEdit(b: Banner) { setEditing(b); setModalOpen(true); }

  async function move(index: number, direction: -1 | 1) {
    const next = [...banners];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((b, i) => ({ ...b, sort_order: i + 1 }));
    setBanners(reordered);
    const supabase = createBrowserSupabaseClient();
    await Promise.all(
      reordered.map((b) => supabase?.from("banners").update({ sort_order: b.sort_order }).eq("id", b.id))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    const supabase = createBrowserSupabaseClient();
    await supabase?.from("banners").delete().eq("id", id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  async function handleDeleteSelected(ids: string[]) {
    const supabase = createBrowserSupabaseClient();
    await supabase?.from("banners").delete().in("id", ids);
    setBanners((prev) => prev.filter((b) => !ids.includes(b.id)));
  }

  async function handleSaved() {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase!.from("banners").select("*").order("sort_order");
    if (data) setBanners(data);
    setModalOpen(false);
  }

  const nextSortOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.sort_order)) + 1 : 1;

  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
      <PageHeader
        title="Banners"
        description="Control branch-specific promotional cards shown on the public home page."
        action={
          <button onClick={openNew} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white hover:bg-red-700 transition active:scale-[0.98]">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Banner
          </button>
        }
      />

      <Table
        headers={["Headline", "Branch", "Link", "Status", "Reorder", ""]}
        searchable={banners.map((b) => b.headline)}
        rowIds={banners.map((b) => b.id)}
        onDeleteSelected={handleDeleteSelected}
        rows={banners.map((banner, index) => [
          <div key="headline">
            <p className="font-bold text-brand-navy">{banner.headline}</p>
            {banner.subtext && <p className="text-xs text-gray-500">{banner.subtext}</p>}
          </div>,
          branches.find((b) => b.id === banner.branch_id)?.name ?? "Unknown",
          <span key="link" className="capitalize text-gray-500 text-xs">{banner.link_type}</span>,
          <span key="status" className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${banner.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            {banner.is_active ? "Active" : "Paused"}
          </span>,
          <div key="reorder" className="flex items-center gap-1">
            <button onClick={() => move(index, -1)} disabled={index === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move up">
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => move(index, 1)} disabled={index === banners.length - 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move down">
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>,
          <div key="actions" className="flex items-center gap-2">
            <button onClick={() => openEdit(banner)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition" aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => handleDelete(banner.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition" aria-label="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>,
        ])}
      />

      <BannerModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={handleSaved} branches={branches as Branch[]} categories={categories as Category[]} products={products as Product[]} banner={editing} nextSortOrder={nextSortOrder} />
    </AdminShell>
  );
}
