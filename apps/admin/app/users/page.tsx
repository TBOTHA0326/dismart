import { Plus } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { branches, profiles } from "@/lib/data";

// Temporary: simulate active user role from mock data
// Replace with real session check when Supabase Auth is connected
const activeProfile = profiles[0]; // super_admin in seed data
const isSuperAdmin = activeProfile.role === "super_admin";
const isAdmin = activeProfile.role === "admin" || isSuperAdmin;

// branch_manager can only see users in their own branch
const visibleProfiles = isAdmin
  ? profiles
  : profiles.filter((p) => p.branch_id === activeProfile.branch_id);

// branch_manager cannot invite users
const canInvite = isAdmin;

export default function UsersPage() {
  return (
    <AdminShell>
      <PageHeader
        title="Users"
        description="Assign CMS users to branches and control admin or branch manager access."
        action={
          canInvite ? (
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Invite User
            </button>
          ) : undefined
        }
      />
      <Table
        headers={["Name", "Role", "Branch"]}
        rows={visibleProfiles.map((profile) => [
          <span className="font-bold text-brand-navy" key="name">{profile.full_name}</span>,
          profile.role.replace(/_/g, " "),
          profile.branch_id
            ? branches.find((b) => b.id === profile.branch_id)?.name ?? "Unknown"
            : "All branches",
        ])}
      />
    </AdminShell>
  );
}
