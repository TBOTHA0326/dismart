import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { RESERVATION_STATUSES, type ReservationStatus } from "@dismart/shared";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status as ReservationStatus | undefined;
  if (!status || !RESERVATION_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid reservation status" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("update_reservation_status", {
    target_reservation_id: params.id,
    next_status: status,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ reservation: data });
}
