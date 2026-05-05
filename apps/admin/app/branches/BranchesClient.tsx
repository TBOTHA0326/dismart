"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import BranchModal from "@/components/branches/BranchModal";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Branch, Profile } from "@dismart/shared";

interface Props {
  profile: Profile;
  initialBranches: Branch[];
}

export default function BranchesClient({ profile, initialBranches }: Props) {
  const [branches, setBranches] = useState(initialBranches);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | undefined>();

  const canEdit = profile.role === "super_admin";

  function openNew() { setEditing(undefined); setModalOpen(true); }
  function openEdit(b: Branch) { setEditing(b); setModalOpen(true); }

  async function handleSaved() {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase!.from("branches").select("*").order("name");
    if (data) setBranches(data);
    setModalOpen(false);
  }

  return (
    <AdminShell role={profile.role}>
      <PageHeader
        title="Branches"
        description="Branch setup for contact details, WhatsApp numbers and active status."
        action={
          canEdit ? (
            <button onClick={openNew} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white hover:bg-red-700 transition active:scale-[0.98]">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Branch
            </button>
          ) : undefined
        }
      />

      <Table
        headers={["Branch", "Address", "Phone", "WhatsApp", "Status", ""]}
        searchable={branches.map((b) => b.name)}
        rows={branches.map((branch) => [
          <span key="name" className="font-bold text-brand-navy">{branch.name}</span>,
          branch.address,
          branch.phone,
          branch.whatsapp_number,
          <span key="status" className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${branch.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            {branch.is_active ? "Active" : "Inactive"}
          </span>,
          canEdit ? (
            <button key="edit" onClick={() => openEdit(branch)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition" aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : <span key="edit" />,
        ])}
      />

      <BranchModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={handleSaved} branch={editing} />
    </AdminShell>
  );
}
