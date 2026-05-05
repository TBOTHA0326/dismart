import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();
  const [{ data: products }, { data: categories }, { data: branches }] = await Promise.all([
    supabase.from("products").select("*, product_branches(branch_id)"),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("branches").select("*").eq("is_active", true),
  ]);

  const normalised = (products ?? []).map((p: any) => ({
    ...p,
    branch_ids: (p.product_branches ?? []).map((pb: any) => pb.branch_id),
  }));

  return (
    <ProductsClient
      profile={profile}
      initialProducts={normalised}
      categories={categories ?? []}
      branches={branches ?? []}
    />
  );
}
