"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import DealModal from "@/components/deals/DealModal";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Branch, DealPamphlet, Profile } from "@dismart/shared";

interface Props {
  profile: Profile;
  initialDeals: DealPamphlet[];
  branches: Branch[];
  activeBranchId: string | null;
}

export default function DealsClient({ profile, initialDeals, branches, activeBranchId }: Props) {
  const [deals, setDeals] = useState(initialDeals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DealPamphlet | undefined>();

  function openNew() { setEditing(undefined); setModalOpen(true); }
  function openEdit(d: DealPamphlet) { setEditing(d); setModalOpen(true); }

  async function move(index: number, direction: -1 | 1) {
    const next = [...deals];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((d, i) => ({ ...d, sort_order: i + 1 }));
    setDeals(reordered);
    const supabase = createBrowserSupabaseClient();
    await Promise.all(
      reordered.map((d) => supabase?.from("deal_pamphlets").update({ sort_order: d.sort_order }).eq("id", d.id))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this deal?")) return;
    const supabase = createBrowserSupabaseClient();
    await supabase?.from("deal_pamphlets").delete().eq("id", id);
    setDeals((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleDeleteSelected(ids: string[]) {
    const supabase = createBrowserSupabaseClient();
    await supabase?.from("deal_pamphlets").delete().in("id", ids);
    setDeals((prev) => prev.filter((d) => !ids.includes(d.id)));
  }

  async function handleSaved() {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase!.from("deal_pamphlets").select("*").order("sort_order");
    if (data) setDeals(data);
    setModalOpen(false);
  }

  const nextSortOrder = deals.length > 0 ? Math.max(...deals.map((d) => d.sort_order)) + 1 : 1;

  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
      <PageHeader
        title="Deals"
        description="Upload savings pamphlets, PDFs and images per branch."
        action={
          <button onClick={openNew} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white hover:bg-red-700 transition active:scale-[0.98]">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Deal
          </button>
        }
      />

      <Table
        headers={["Title", "Branch", "Type", "Status", "Reorder", ""]}
        searchable={deals.map((d) => d.title)}
        rowIds={deals.map((d) => d.id)}
        onDeleteSelected={handleDeleteSelected}
        rows={deals.map((deal, index) => [
          <div key="title">
            <p className="font-bold text-brand-navy">{deal.title}</p>
            {deal.description && <p className="text-xs text-gray-500">{deal.description}</p>}
          </div>,
          branches.find((b) => b.id === deal.branch_id)?.name ?? "Unknown",
          <span key="type" className="capitalize text-xs text-gray-500">{deal.asset_type}</span>,
          <span key="status" className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${deal.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            {deal.is_active ? "Active" : "Paused"}
          </span>,
          <div key="reorder" className="flex items-center gap-1">
            <button onClick={() => move(index, -1)} disabled={index === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move up">
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => move(index, 1)} disabled={index === deals.length - 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move down">
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>,
          <div key="actions" className="flex items-center gap-2">
            <button onClick={() => openEdit(deal)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition" aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => handleDelete(deal.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition" aria-label="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>,
        ])}
      />

      <DealModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={handleSaved} branches={branches} deal={editing} nextSortOrder={nextSortOrder} />
    </AdminShell>
  );
}
