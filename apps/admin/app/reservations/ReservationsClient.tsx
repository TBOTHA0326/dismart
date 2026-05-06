"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import {
  formatCurrency,
  getReservationStatusLabel,
  type Profile,
  type Reservation,
  type ReservationStatus,
} from "@dismart/shared";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

type ReservationRow = Reservation & {
  products?: { name: string; price: number } | null;
  branches?: { name: string; whatsapp_number: string } | null;
};

interface Props {
  profile: Profile;
  initialReservations: ReservationRow[];
  branches: { id: string; name: string; whatsapp_number: string }[];
  activeBranchId: string | null;
}

const actionStatuses: ReservationStatus[] = ["CONTACTED", "CONFIRMED", "COLLECTED", "NOT_COLLECTED", "CANCELLED"];

export default function ReservationsClient({ profile, initialReservations, branches, activeBranchId }: Props) {
  const [reservations, setReservations] = useState(initialReservations);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel("reservations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // New reservation: fetch with joined product/branch data then prepend
            supabase
              .from("reservations")
              .select("*, products(name, price), branches(name, whatsapp_number)")
              .eq("id", payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) setReservations((prev) => [data as ReservationRow, ...prev]);
              });
          } else if (payload.eventType === "UPDATE") {
            setReservations((prev) =>
              prev.map((r) => r.id === payload.new.id ? { ...r, ...payload.new } : r)
            );
          } else if (payload.eventType === "DELETE") {
            setReservations((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, []);

  const searchIndex = useMemo(
    () => reservations.map((reservation) => [
      reservation.products?.name ?? "",
      reservation.customer_name,
      reservation.whatsapp_number,
      reservation.status,
    ].join(" ")),
    [reservations]
  );

  async function updateStatus(id: string, status: ReservationStatus) {
    setError(null);
    setUpdatingId(id);
    const response = await fetch(`/api/reservations/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = await response.json().catch(() => ({}));
    setUpdatingId(null);

    if (!response.ok) {
      setError(payload.error ?? "Could not update reservation status.");
      return;
    }

    setReservations((current) =>
      current.map((reservation) =>
        reservation.id === id ? { ...reservation, ...payload.reservation } : reservation
      )
    );
  }

  async function expireNow() {
    setError(null);
    const response = await fetch("/api/reservations/expire", { method: "POST" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error ?? "Could not process expired reservations.");
      return;
    }
    window.location.reload();
  }

  function messageCustomer(reservation: ReservationRow) {
    const branch = branches.find((item) => item.id === reservation.branch_id);
    const text = [
      `Hi ${reservation.customer_name}, this is Dismart ${branch?.name ?? reservation.branches?.name ?? ""}.`,
      `We are following up on your reservation for ${reservation.quantity} x ${reservation.products?.name ?? "your product"}.`,
    ].join("\n");

    return `https://wa.me/${reservation.whatsapp_number}?text=${encodeURIComponent(text)}`;
  }

  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
      <PageHeader
        title="Reservations"
        description="Track customer holds, contact shoppers and release stock when reservations expire or are cancelled."
        action={
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${connected ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {connected ? "Live" : "Connecting…"}
            </span>
            <button
              type="button"
              onClick={expireNow}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-brand-navy transition hover:border-brand-yellow active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Process Expired Reservations
            </button>
          </div>
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <Table
        headers={["Product", "Qty", "Customer", "WhatsApp", "Status", "Expires", "Created", ""]}
        searchable={searchIndex}
        rows={reservations.map((reservation) => [
          <div key="product">
            <p className="font-bold text-brand-navy">{reservation.products?.name ?? "Unknown product"}</p>
            <p className="text-xs text-gray-500">{formatCurrency(reservation.total_price)} total</p>
          </div>,
          <span key="qty" className="font-black text-brand-navy">{reservation.quantity}</span>,
          reservation.customer_name,
          <a key="wa" href={`tel:${reservation.whatsapp_number}`} className="font-semibold text-brand-navy hover:underline">
            {reservation.whatsapp_number}
          </a>,
          <span key="status" className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${statusClass(reservation.status)}`}>
            {getReservationStatusLabel(reservation.status)}
          </span>,
          <span key="expires" className={new Date(reservation.expires_at).getTime() < Date.now() ? "font-bold text-brand-red" : "text-gray-700"}>
            {formatDateTime(reservation.expires_at)}
          </span>,
          formatDateTime(reservation.created_at),
          <div key="actions" className="flex flex-wrap justify-end gap-2">
            <a
              href={messageCustomer(reservation)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-green-200 hover:text-green-700"
              aria-label="Message customer"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <select
              value={reservation.status}
              disabled={updatingId === reservation.id}
              onChange={(event) => updateStatus(reservation.id, event.target.value as ReservationStatus)}
              className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-bold text-brand-navy outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 disabled:opacity-50"
              aria-label="Update reservation status"
            >
              <option value={reservation.status}>{getReservationStatusLabel(reservation.status)}</option>
              {actionStatuses.filter((status) => status !== reservation.status).map((status) => (
                <option key={status} value={status}>{getReservationStatusLabel(status)}</option>
              ))}
            </select>
          </div>,
        ])}
      />
    </AdminShell>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClass(status: ReservationStatus) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-50 text-yellow-700";
    case "CONTACTED":
      return "bg-blue-50 text-blue-700";
    case "CONFIRMED":
      return "bg-brand-navy/10 text-brand-navy";
    case "COLLECTED":
      return "bg-green-50 text-green-700";
    case "EXPIRED":
    case "NOT_COLLECTED":
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-600";
  }
}
