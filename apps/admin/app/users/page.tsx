import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();

  const isAdmin = profile.role === "super_admin" || profile.role === "admin";

  const query = supabase.from("profiles").select("*, branches(name)");
  if (!isAdmin) query.eq("branch_id", profile.branch_id);

  const [{ data: profiles }, { data: branches }] = await Promise.all([
    query,
    supabase.from("branches").select("id, name").eq("is_active", true),
  ]);

  return (
    <UsersClient
      profile={profile}
      initialProfiles={profiles ?? []}
      branches={branches ?? []}
    />
  );
}
