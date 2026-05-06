"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import CategoryModal from "@/components/categories/CategoryModal";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Category, Profile } from "@dismart/shared";

interface Props {
  profile: Profile;
  initialCategories: Category[];
  branches: { id: string; name: string }[];
  activeBranchId: string | null;
}

export default function CategoriesClient({ profile, initialCategories, branches, activeBranchId }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();

  function openNew() { setEditing(undefined); setModalOpen(true); }
  function openEdit(cat: Category) { setEditing(cat); setModalOpen(true); }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const supabase = createBrowserSupabaseClient();
    await supabase?.from("categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleDeleteSelected(ids: string[]) {
    const supabase = createBrowserSupabaseClient();
    await supabase?.from("categories").delete().in("id", ids);
    setCategories((prev) => prev.filter((c) => !ids.includes(c.id)));
  }

  async function move(index: number, direction: -1 | 1) {
    const next = [...categories];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCategories(reordered);

    const supabase = createBrowserSupabaseClient();
    await Promise.all(
      reordered.map((c) => supabase?.from("categories").update({ sort_order: c.sort_order }).eq("id", c.id))
    );
  }

  async function handleSaved() {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase!.from("categories").select("*").order("sort_order");
    if (data) setCategories(data);
    setModalOpen(false);
  }

  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
      <PageHeader
        title="Categories"
        description="Manage the public category strip, icon names and display order."
        action={
          <button onClick={openNew} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white hover:bg-red-700 transition active:scale-[0.98]">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Category
          </button>
        }
      />

      <Table
        headers={["Name", "Icon", "Order", "Reorder", ""]}
        searchable={categories.map((c) => c.name)}
        rowIds={categories.map((c) => c.id)}
        onDeleteSelected={handleDeleteSelected}
        rows={categories.map((cat, index) => [
          <span key="name" className="font-bold text-brand-navy">{cat.name}</span>,
          <code key="icon" className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{cat.icon_name}</code>,
          cat.sort_order,
          <div key="reorder" className="flex items-center gap-1">
            <button onClick={() => move(index, -1)} disabled={index === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move up">
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => move(index, 1)} disabled={index === categories.length - 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move down">
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>,
          <div key="actions" className="flex items-center gap-2">
            <button onClick={() => openEdit(cat)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition" aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => handleDelete(cat.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition" aria-label="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>,
        ])}
      />

      <CategoryModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={handleSaved} nextSortOrder={categories.length + 1} category={editing} />
    </AdminShell>
  );
}
