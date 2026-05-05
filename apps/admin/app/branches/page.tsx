import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import BranchesClient from "./BranchesClient";

export default async function BranchesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();
  const { data: branches } = await supabase.from("branches").select("*").order("name");

  return <BranchesClient profile={profile} initialBranches={branches ?? []} />;
}
