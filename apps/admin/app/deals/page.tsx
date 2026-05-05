import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DealsClient from "./DealsClient";

export default async function DealsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();
  const [{ data: deals }, { data: branches }] = await Promise.all([
    supabase.from("deal_pamphlets").select("*").order("sort_order"),
    supabase.from("branches").select("*").eq("is_active", true),
  ]);

  return <DealsClient profile={profile} initialDeals={deals ?? []} branches={branches ?? []} />;
}
