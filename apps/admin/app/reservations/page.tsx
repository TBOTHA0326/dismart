import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ReservationsClient from "./ReservationsClient";

export default async function ReservationsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();
  const [{ data: reservations }, { data: branches }] = await Promise.all([
    supabase
      .from("reservations")
      .select("*, products(name, price), branches(name, whatsapp_number)")
      .order("created_at", { ascending: false }),
    supabase.from("branches").select("id, name, whatsapp_number").order("name"),
  ]);

  return (
    <ReservationsClient
      profile={profile}
      initialReservations={(reservations ?? []) as any[]}
      branches={(branches ?? []) as any[]}
    />
  );
}
