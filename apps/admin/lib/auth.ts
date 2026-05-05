import { createSupabaseServerClient } from "./supabase-server";
import type { Profile } from "@dismart/shared";

export async function getProfile(): Promise<Profile | null> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}
