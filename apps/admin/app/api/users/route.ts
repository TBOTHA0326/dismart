import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getProfile } from "@/lib/auth";

export async function POST(request: Request) {
  const caller = await getProfile();
  if (!caller || caller.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { full_name, email, password, role, branch_id } = body;

  if (!full_name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !data.user) {
    return NextResponse.json({ error: authError?.message ?? "Failed to create auth user" }, { status: 500 });
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    full_name,
    role,
    branch_id: branch_id || null,
  });

  if (profileError) {
    // Roll back the auth user if profile insert fails
    await admin.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.user.id });
}

export async function PATCH(request: Request) {
  const caller = await getProfile();
  if (!caller || (caller.role !== "super_admin" && caller.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, full_name, role, branch_id } = body;

  if (!id || !full_name || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Admins cannot elevate anyone to super_admin
  if (caller.role === "admin" && role === "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({
    full_name,
    role,
    branch_id: branch_id || null,
  }).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
