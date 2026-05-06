import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DealsClient from "./DealsClient";

export default async function DealsPage({
  searchParams,
}: {
  searchParams: { branch?: string };
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();

  const isBranchManager = profile.role === "branch_manager";
  const activeBranchId: string | null = isBranchManager
    ? (profile.branch_id ?? null)
    : (searchParams.branch ?? null) || null;

  const [{ data: deals }, { data: branches }] = await Promise.all([
    activeBranchId
      ? supabase.from("deal_pamphlets").select("*").eq("branch_id", activeBranchId).order("sort_order")
      : supabase.from("deal_pamphlets").select("*").order("sort_order"),
    supabase.from("branches").select("*").eq("is_active", true),
  ]);

  return (
    <DealsClient
      profile={profile}
      branches={branches ?? []}
      activeBranchId={activeBranchId}
      initialDeals={deals ?? []}
    />
  );
}
