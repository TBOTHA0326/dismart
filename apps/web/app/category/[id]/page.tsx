import { createClient } from "@/lib/supabase-server";
import CategoryClient from "./CategoryClient";

interface PageProps {
  params: { id: string };
}

export default async function CategoryPage({ params }: PageProps) {
  const supabase = createClient();

  const [{ data: branches }, { data: categories }, { data: category }] = await Promise.all([
    supabase.from("branches").select("*").eq("is_active", true).order("name"),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("categories").select("*").eq("id", params.id).single(),
  ]);

  return (
    <CategoryClient
      categoryId={params.id}
      category={category}
      branches={branches ?? []}
      categories={categories ?? []}
    />
  );
}
