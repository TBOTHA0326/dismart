import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage({
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

  const [{ data: categories }, { data: branches }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("branches").select("id, name").eq("is_active", true),
  ]);

  return (
    <CategoriesClient
      profile={profile}
      branches={branches ?? []}
      activeBranchId={activeBranchId}
      initialCategories={categories ?? []}
    />
  );
}
