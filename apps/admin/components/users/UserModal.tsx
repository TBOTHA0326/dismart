"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import type { Branch, Profile } from "@dismart/shared";

const input = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-base md:text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10";
const select = `${input} cursor-pointer`;

interface Props {
  open: boolean;
  onClose: () => void;
  branches: Branch[];
  profile?: Profile;
  isSuperAdmin: boolean;
  onSaved: () => void;
}

export default function UserModal({ open, onClose, branches, profile, isSuperAdmin, onSaved }: Props) {
  const editing = !!profile;
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    email: "",
    password: "",
    role: profile?.role ?? "branch_manager" as Profile["role"],
    branch_id: profile?.branch_id ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const needsBranch = form.role === "branch_manager";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const url = "/api/users";
    const method = editing ? "PATCH" : "POST";
    const body = editing
      ? { id: profile.id, full_name: form.full_name, role: form.role, branch_id: form.branch_id || null }
      : { full_name: form.full_name, email: form.email, password: form.password, role: form.role, branch_id: form.branch_id || null };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit User" : "New User"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full name" htmlFor="usr-name">
          <input
            id="usr-name"
            className={input}
            placeholder="e.g. Meyerton Manager"
            required
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
          />
        </FormField>

        {!editing && (
          <>
            <FormField label="Email address" htmlFor="usr-email">
              <input
                id="usr-email"
                type="email"
                className={input}
                placeholder="manager@dismart.co.za"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </FormField>
            <FormField label="Password" htmlFor="usr-password" hint="User can change this after first login">
              <input
                id="usr-password"
                type="password"
                className={input}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </FormField>
          </>
        )}

        <FormField label="Role" htmlFor="usr-role">
          <select
            id="usr-role"
            className={select}
            value={form.role}
            onChange={(e) => {
              set("role", e.target.value);
              if (e.target.value !== "branch_manager") set("branch_id", "");
            }}
          >
            {isSuperAdmin && <option value="super_admin">Super Admin</option>}
            <option value="admin">Admin</option>
            <option value="branch_manager">Branch Manager</option>
          </select>
        </FormField>

        {needsBranch && (
          <FormField label="Assigned branch" htmlFor="usr-branch">
            <select
              id="usr-branch"
              className={select}
              required
              value={form.branch_id}
              onChange={(e) => set("branch_id", e.target.value)}
            >
              <option value="">Select branch…</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </FormField>
        )}

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-brand-navy py-2.5 text-sm font-bold text-white hover:bg-brand-navy/90 transition disabled:opacity-60">
            {saving ? "Saving…" : editing ? "Save Changes" : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
