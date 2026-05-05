"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { formatCurrency, getAvailableStock, type Branch, type Product } from "@dismart/shared";

interface Props {
  open: boolean;
  onClose: () => void;
  product: Product;
  branch: Branch;
}

const inputClass = "h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10";

export default function ReserveModal({ open, onClose, product, branch }: Props) {
  const availableStock = getAvailableStock(product);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [timeframe, setTimeframe] = useState<"1" | "3" | "6" | "custom">("1");
  const [customExpiresAt, setCustomExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const total = useMemo(() => product.price * quantity, [product.price, quantity]);

  if (!open) return null;

  function changeQuantity(delta: number) {
    setQuantity((current) => Math.min(availableStock, Math.max(1, current + delta)));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: product.id,
        branch_id: branch.id,
        quantity,
        customer_name: customerName,
        whatsapp_number: whatsappNumber,
        timeframe_hours: timeframe === "custom" ? undefined : Number(timeframe),
        custom_expires_at: timeframe === "custom" ? customExpiresAt : undefined,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Could not reserve this product. Please try again.");
      return;
    }

    setSuccess(`Reserved until ${new Date(payload.reservation.expires_at).toLocaleString("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    })}. The branch team will contact you.`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4">
      <div className="absolute inset-0 bg-brand-navy/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-red">Reserve stock</p>
            <h2 className="mt-1 text-lg font-black leading-tight text-brand-navy">{product.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-brand-navy active:scale-[0.98]"
            aria-label="Close reservation form"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-4 py-5 sm:px-6">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Available at {branch.name}</p>
                <p className="mt-1 text-2xl font-black text-brand-navy">{availableStock} left</p>
              </div>
              <p className="text-right text-2xl font-black text-brand-red">{formatCurrency(total)}</p>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-white p-2">
              <button
                type="button"
                onClick={() => changeQuantity(-1)}
                disabled={quantity <= 1}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-brand-navy transition hover:border-brand-yellow disabled:opacity-40 active:scale-[0.98]"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Quantity</p>
                <p className="text-xl font-black text-brand-navy">{quantity}</p>
              </div>
              <button
                type="button"
                onClick={() => changeQuantity(1)}
                disabled={quantity >= availableStock}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-brand-navy transition hover:border-brand-yellow disabled:opacity-40 active:scale-[0.98]"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Name</span>
              <input className={inputClass} required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Your name" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">WhatsApp number</span>
              <input className={inputClass} required value={whatsappNumber} onChange={(event) => setWhatsappNumber(event.target.value)} placeholder="e.g. 27821234567" />
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Hold for</p>
            <div className="grid grid-cols-3 gap-2">
              {(["1", "3", "6"] as const).map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setTimeframe(hours)}
                  className={`min-h-11 rounded-lg border text-sm font-black transition active:scale-[0.98] ${
                    timeframe === hours
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-gray-200 bg-white text-brand-navy hover:border-brand-yellow"
                  }`}
                >
                  {hours} hour{hours === "1" ? "" : "s"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTimeframe("custom")}
              className={`min-h-11 w-full rounded-lg border text-sm font-black transition active:scale-[0.98] ${
                timeframe === "custom"
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-gray-200 bg-white text-brand-navy hover:border-brand-yellow"
              }`}
            >
              Custom date/time
            </button>
            {timeframe === "custom" && (
              <input
                type="datetime-local"
                className={inputClass}
                required
                value={customExpiresAt}
                onChange={(event) => setCustomExpiresAt(event.target.value)}
              />
            )}
          </div>

          {error && <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
          {success && <p className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">{success}</p>}

          <button
            type="submit"
            disabled={submitting || availableStock <= 0}
            className="min-h-12 w-full rounded-lg bg-brand-red px-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-red-700 disabled:opacity-50 active:scale-[0.98]"
          >
            {submitting ? "Reserving..." : "Reserve & Get Contacted"}
          </button>
        </form>
      </div>
    </div>
  );
}
