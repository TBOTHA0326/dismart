import { createClient } from "@/lib/supabase-server";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: branches }, { data: categories }] = await Promise.all([
    supabase.from("branches").select("*").eq("is_active", true).order("name"),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  return <HomeClient branches={branches ?? []} categories={categories ?? []} />;
}
