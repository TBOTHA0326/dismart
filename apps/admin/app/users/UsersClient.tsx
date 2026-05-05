"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import UserModal from "@/components/users/UserModal";
import type { Branch, Profile } from "@dismart/shared";

const ROLE_LABELS: Record<Profile["role"], string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  branch_manager: "Branch Manager",
};

interface Props {
  profile: Profile;
  initialProfiles: Profile[];
  branches: Pick<Branch, "id" | "name">[];
}

export default function UsersClient({ profile, initialProfiles, branches }: Props) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | undefined>();

  const isSuperAdmin = profile.role === "super_admin";
  const isAdmin = profile.role === "admin" || isSuperAdmin;
  const canCreate = isSuperAdmin;
  const canEdit = isAdmin;

  function openNew() { setEditing(undefined); setModalOpen(true); }
  function openEdit(p: Profile) { setEditing(p); setModalOpen(true); }

  async function handleSaved() {
    // Reload the page to get fresh server-fetched profiles
    window.location.reload();
  }

  return (
    <AdminShell role={profile.role}>
      <PageHeader
        title="Users"
        description="Assign CMS users to branches and control admin or branch manager access."
        action={
          canCreate ? (
            <button onClick={openNew} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white hover:bg-red-700 transition active:scale-[0.98]">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New User
            </button>
          ) : undefined
        }
      />

      <Table
        headers={["Name", "Role", "Branch", ""]}
        searchable={profiles.map((p) => p.full_name)}
        rows={profiles.map((p) => [
          <span key="name" className="font-bold text-brand-navy">{p.full_name}</span>,
          <span key="role" className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
            p.role === "super_admin" ? "bg-brand-navy/10 text-brand-navy"
            : p.role === "admin" ? "bg-blue-50 text-blue-700"
            : "bg-gray-100 text-gray-600"
          }`}>
            {ROLE_LABELS[p.role]}
          </span>,
          p.branch_id
            ? branches.find((b) => b.id === p.branch_id)?.name ?? "Unknown"
            : "All branches",
          canEdit ? (
            <button key="edit" onClick={() => openEdit(p)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition" aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : <span key="edit" />,
        ])}
      />

      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        branches={branches as Branch[]}
        profile={editing}
        isSuperAdmin={isSuperAdmin}
      />
    </AdminShell>
  );
}
