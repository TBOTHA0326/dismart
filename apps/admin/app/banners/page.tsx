import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import BannersClient from "./BannersClient";

export default async function BannersPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();
  const [{ data: banners }, { data: branches }, { data: categories }, { data: products }] = await Promise.all([
    supabase.from("banners").select("*").order("sort_order"),
    supabase.from("branches").select("*").eq("is_active", true),
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("products").select("id, name"),
  ]);

  return (
    <BannersClient
      profile={profile}
      initialBanners={banners ?? []}
      branches={branches ?? []}
      categories={categories ?? []}
      products={products ?? []}
    />
  );
}
