import { Lock, Plus } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { branches, profiles } from "@/lib/data";

// Temporary: simulate active user role from mock data
// Replace with real session check when Supabase Auth is connected
const activeProfile = profiles[0]; // super_admin in seed data
const isSuperAdmin = activeProfile.role === "super_admin";

export default function BranchesPage() {
  return (
    <AdminShell>
      <PageHeader
        title="Branches"
        description="Branch setup for contact details, WhatsApp numbers and active status. Managed by Chenexa."
        action={
          isSuperAdmin ? (
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Branch
            </button>
          ) : (
            <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 text-sm font-bold text-gray-400 cursor-not-allowed">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Managed by Chenexa
            </div>
          )
        }
      />
      <Table
        headers={["Branch", "Address", "Phone", "WhatsApp", "Status"]}
        rows={branches.map((branch) => [
          <span className="font-bold text-brand-navy" key="branch">{branch.name}</span>,
          branch.address,
          branch.phone,
          branch.whatsapp_number,
          branch.is_active ? "Active" : "Inactive",
        ])}
      />
    </AdminShell>
  );
}
