import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");

  return <CategoriesClient profile={profile} initialCategories={categories ?? []} />;
}
