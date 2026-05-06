import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("./DashboardClient"), { ssr: false });

export default async function DashboardPage({
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

  const [
    { data: products },
    { data: deals },
    { data: bannersRaw },
    { data: branches },
    { data: reservations },
    { data: categories },
    { data: productBranches },
  ] = await Promise.all([
    supabase.from("products").select("id, is_special, expiry_date, stock_status"),
    activeBranchId
      ? supabase.from("deal_pamphlets").select("id, is_active").eq("branch_id", activeBranchId)
      : supabase.from("deal_pamphlets").select("id, is_active"),
    activeBranchId
      ? supabase.from("banners").select("id, headline, branch_id, is_active, sort_order").eq("branch_id", activeBranchId)
      : supabase.from("banners").select("id, headline, branch_id, is_active, sort_order"),
    supabase.from("branches").select("id, name, is_active"),
    activeBranchId
      ? supabase.from("reservations").select("id, status, created_at, branch_id").eq("branch_id", activeBranchId)
      : supabase.from("reservations").select("id, status, created_at, branch_id"),
    supabase.from("categories").select("id"),
    activeBranchId
      ? supabase.from("product_branches").select("product_id, branch_id").eq("branch_id", activeBranchId)
      : supabase.from("product_branches").select("product_id, branch_id"),
  ]);

  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const branchProductIds = new Set((productBranches ?? []).map((pb) => pb.product_id));
  const filteredProducts = activeBranchId
    ? (products ?? []).filter((p) => branchProductIds.has(p.id))
    : (products ?? []);

  const branchProductCounts = (branches ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    is_active: b.is_active,
    productCount: (productBranches ?? []).filter((pb) => pb.branch_id === b.id).length,
  }));

  const visibleBranches = isBranchManager
    ? branchProductCounts.filter((b) => b.id === profile.branch_id)
    : branchProductCounts;

  return (
    <DashboardClient
      profile={profile}
      branches={branches ?? []}
      activeBranchId={activeBranchId}
      productCount={filteredProducts.length}
      specialCount={filteredProducts.filter((p) => p.is_special).length}
      expiringCount={
        filteredProducts.filter((p) => {
          if (!p.expiry_date) return false;
          const d = new Date(p.expiry_date);
          return d >= now && d <= sevenDays;
        }).length
      }
      outOfStockCount={filteredProducts.filter((p) => p.stock_status === "out_of_stock").length}
      dealCount={deals?.length ?? 0}
      activeDealCount={deals?.filter((d) => d.is_active).length ?? 0}
      categoryCount={categories?.length ?? 0}
      pendingReservations={reservations?.filter((r) => r.status === "PENDING").length ?? 0}
      todayReservations={
        reservations?.filter((r) => {
          const d = new Date(r.created_at);
          return d.toDateString() === now.toDateString();
        }).length ?? 0
      }
      totalReservations={reservations?.length ?? 0}
      activeBannerCount={(bannersRaw ?? []).filter((b) => b.is_active).length}
      banners={(bannersRaw ?? []).filter((b) => b.is_active).slice(0, 5)}
      branchStats={visibleBranches}
    />
  );
}
