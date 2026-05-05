import { createClient } from "@/lib/supabase-server";
import BranchClient from "./BranchClient";

export default async function BranchPage() {
  const supabase = createClient();
  const [{ data: branches }, { data: categories }] = await Promise.all([
    supabase.from("branches").select("*").eq("is_active", true).order("name"),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  return <BranchClient branches={branches ?? []} categories={categories ?? []} />;
}
