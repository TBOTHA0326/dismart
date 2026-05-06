import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ReservationsClient from "./ReservationsClient";

export default async function ReservationsPage({
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

  const [{ data: reservations }, { data: branches }] = await Promise.all([
    activeBranchId
      ? supabase
          .from("reservations")
          .select("*, products(name, price), branches(name, whatsapp_number)")
          .eq("branch_id", activeBranchId)
          .order("created_at", { ascending: false })
      : supabase
          .from("reservations")
          .select("*, products(name, price), branches(name, whatsapp_number)")
          .order("created_at", { ascending: false }),
    supabase.from("branches").select("id, name, whatsapp_number").order("name"),
  ]);

  return (
    <ReservationsClient
      profile={profile}
      branches={(branches ?? []) as any[]}
      activeBranchId={activeBranchId}
      initialReservations={(reservations ?? []) as any[]}
    />
  );
}
