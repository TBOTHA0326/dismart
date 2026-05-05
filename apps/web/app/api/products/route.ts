import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branch_id");

  const supabase = createClient();

  if (branchId) {
    const { data, error } = await supabase
      .from("product_branches")
      .select("products(*)")
      .eq("branch_id", branchId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const products = (data ?? [])
      .map((row: any) => row.products)
      .filter(Boolean)
      .map((product: any) => ({ ...product, branch_ids: [branchId] }));

    return NextResponse.json({ products });
  }

  const { data, error } = await supabase
    .from("products")
    .select("*, product_branches(branch_id)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const products = (data ?? []).map((product: any) => ({
    ...product,
    branch_ids: (product.product_branches ?? []).map((pb: any) => pb.branch_id),
    product_branches: undefined,
  }));

  return NextResponse.json({ products });
}
