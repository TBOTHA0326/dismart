import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_branches(branch_id)")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json({
    product: {
      ...data,
      branch_ids: ((data as any).product_branches ?? []).map((pb: any) => pb.branch_id),
      product_branches: undefined,
    },
  });
}
