import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage({
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

  const [{ data: productsRaw }, { data: categories }, { data: branches }] = await Promise.all([
    activeBranchId
      ? supabase
          .from("products")
          .select("*, product_branches!inner(branch_id)")
          .eq("product_branches.branch_id", activeBranchId)
          .order("created_at", { ascending: false })
      : supabase
          .from("products")
          .select("*, product_branches(branch_id)")
          .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("branches").select("*").eq("is_active", true),
  ]);

  const normalised = (productsRaw ?? []).map((p: any) => ({
    ...p,
    branch_ids: (p.product_branches ?? []).map((pb: any) => pb.branch_id),
  }));

  return (
    <ProductsClient
      profile={profile}
      branches={branches ?? []}
      activeBranchId={activeBranchId}
      initialProducts={normalised}
      categories={categories ?? []}
    />
  );
}
