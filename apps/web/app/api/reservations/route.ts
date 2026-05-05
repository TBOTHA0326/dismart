import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const allowedHours = new Set([1, 3, 6]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    product_id,
    branch_id,
    quantity,
    customer_name,
    whatsapp_number,
    timeframe_hours,
    custom_expires_at,
  } = body;

  const parsedQuantity = Number(quantity);
  if (!product_id || !branch_id || !customer_name || !whatsapp_number || !Number.isInteger(parsedQuantity)) {
    return NextResponse.json({ error: "Missing required reservation details" }, { status: 400 });
  }

  let expiresAt: Date;
  if (custom_expires_at) {
    expiresAt = new Date(custom_expires_at);
  } else {
    const hours = Number(timeframe_hours);
    if (!allowedHours.has(hours)) {
      return NextResponse.json({ error: "Choose a valid reservation timeframe" }, { status: 400 });
    }
    expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Reservation expiry must be in the future" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("create_reservation", {
    target_product_id: product_id,
    target_branch_id: branch_id,
    reserve_quantity: parsedQuantity,
    customer_name,
    whatsapp_number,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ reservation: data }, { status: 201 });
}
