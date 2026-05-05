import { createClient } from "@/lib/supabase-server";
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: PageProps) {
  const supabase = createClient();

  const [{ data: product }, { data: branches }] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(*), product_branches(branch_id)")
      .eq("id", params.id)
      .single(),
    supabase.from("branches").select("*").eq("is_active", true).order("name"),
  ]);

  if (!product) notFound();

  const category = (product as any).categories ?? null;
  const branchIds = ((product as any).product_branches ?? []).map((pb: any) => pb.branch_id);
  const normalised = { ...product, branch_ids: branchIds, categories: undefined, product_branches: undefined };

  return (
    <ProductClient
      product={normalised}
      category={category}
      branches={branches ?? []}
    />
  );
}
