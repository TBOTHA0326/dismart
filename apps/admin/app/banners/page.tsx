import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import BannersClient from "./BannersClient";

export default async function BannersPage({
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

  const [{ data: banners }, { data: branches }, { data: categories }, { data: products }] = await Promise.all([
    activeBranchId
      ? supabase.from("banners").select("*").eq("branch_id", activeBranchId).order("sort_order")
      : supabase.from("banners").select("*").order("sort_order"),
    supabase.from("branches").select("*").eq("is_active", true),
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("products").select("id, name"),
  ]);

  return (
    <BannersClient
      profile={profile}
      branches={branches ?? []}
      activeBranchId={activeBranchId}
      initialBanners={banners ?? []}
      categories={categories ?? []}
      products={products ?? []}
    />
  );
}
