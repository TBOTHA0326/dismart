"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, getAvailableStock, isReservable, type Product, type Branch } from "@dismart/shared";
import Badge from "@/components/ui/Badge";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import ReserveModal from "./ReserveModal";

interface ProductCardProps {
  product: Product;
  branch: Branch;
}

export default function ProductCard({ product, branch }: ProductCardProps) {
  const [reserveOpen, setReserveOpen] = useState(false);
  const availableStock = getAvailableStock(product);
  const canReserve = isReservable(product);

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        <Link href={`/product/${product.id}`} className="relative block aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          {product.is_special && (
            <div className="absolute top-2 left-2">
              <Badge variant="special" />
            </div>
          )}
          {product.stock_status === "low_stock" && (
            <div className="absolute top-2 right-2">
              <Badge variant="low-stock" />
            </div>
          )}
          {availableStock > 0 && availableStock <= 5 && (
            <div className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-brand-red shadow-sm">
              Only {availableStock} left
            </div>
          )}
        </Link>

        <div className="p-3 flex flex-col gap-2 flex-1">
          <Link href={`/product/${product.id}`}>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-brand-navy transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="mt-auto">
            <p className="text-xl font-black text-brand-navy">
              {formatCurrency(product.price)}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
              {availableStock > 0 ? `${availableStock} available` : "Out of stock"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReserveOpen(true)}
            disabled={!canReserve}
            className="min-h-9 w-full rounded-lg bg-brand-red px-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 active:scale-[0.98]"
          >
            Reserve
          </button>
          <WhatsAppButton
            href={buildWhatsAppLink(branch, product)}
            label="Enquire"
            size="sm"
            fullWidth
          />
        </div>
      </div>
      <ReserveModal open={reserveOpen} onClose={() => setReserveOpen(false)} product={product} branch={branch} />
    </>
  );
}
