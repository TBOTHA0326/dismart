import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();

  const [{ data: products }, { data: deals }, { data: banners }, { data: branches }] =
    await Promise.all([
      supabase.from("products").select("id, is_special, expiry_date"),
      supabase.from("deal_pamphlets").select("id"),
      supabase.from("banners").select("id, headline, branch_id, is_active, sort_order"),
      supabase.from("branches").select("id, name"),
    ]);

  return (
    <DashboardClient
      profile={profile}
      productCount={products?.length ?? 0}
      specialCount={products?.filter((p) => p.is_special).length ?? 0}
      expiringCount={products?.filter((p) => p.expiry_date).length ?? 0}
      dealCount={deals?.length ?? 0}
      banners={banners ?? []}
      branches={branches ?? []}
    />
  );
}
