import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getProfile } from "@/lib/auth";

async function expireReservations(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    const profile = await getProfile();
    if (!profile || (profile.role !== "super_admin" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("expire_stale_reservations");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ expired: data ?? 0 });
}

export async function GET(request: Request) {
  return expireReservations(request);
}

export async function POST(request: Request) {
  return expireReservations(request);
}
