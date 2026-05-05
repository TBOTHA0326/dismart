"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { Branch, Category, Product } from "@dismart/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
import Badge from "@/components/ui/Badge";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import ProductRow from "@/components/home/ProductRow";
import ReserveModal from "@/components/product/ReserveModal";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { createClient } from "@/lib/supabase";
import { getAvailableStock, isReservable } from "@dismart/shared";

interface Props {
  product: Product;
  category: Category | null;
  branches: Branch[];
}

export default function ProductClient({ product, category, branches }: Props) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reserveOpen, setReserveOpen] = useState(false);
  const availableStock = getAvailableStock(product);
  const canReserve = isReservable(product);

  const handleBranchChange = useCallback((b: Branch) => setBranch(b), []);

  useEffect(() => {
    if (!branch || !category) return;
    const supabase = createClient();
    supabase
      .from("product_branches")
      .select("products(*)")
      .eq("branch_id", branch.id)
      .then(({ data }) => {
        const prods = (data ?? [])
          .map((r: any) => r.products)
          .filter((p: any) => p && p.category_id === category.id && p.id !== product.id)
          .slice(0, 8)
          .map((p: any) => ({ ...p, branch_ids: [branch.id] }));
        setRelated(prods);
      });
  }, [branch, category, product.id]);

  return (
    <>
      <Header branches={branches} onBranchChange={handleBranchChange} activeBranch={branch} />
      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
            <span>/</span>
            {category && (
              <>
                <Link href={`/category/${category.id}`} className="hover:text-brand-navy transition-colors">{category.name}</Link>
                <span>/</span>
              </>
            )}
            <span className="line-clamp-1 font-semibold text-brand-navy">{product.name}</span>
          </nav>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col md:flex-row">
              <div className="relative aspect-square bg-gray-50 md:w-96 md:flex-shrink-0">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 384px"
                  priority
                />
                {product.is_special && (
                  <div className="absolute left-3 top-3">
                    <Badge variant="special" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
                {category && (
                  <Link href={`/category/${category.id}`} className="text-xs font-bold uppercase tracking-widest text-brand-red hover:underline">
                    {category.name}
                  </Link>
                )}
                <h1 className="text-2xl font-black leading-tight text-brand-navy md:text-3xl">{product.name}</h1>
                <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
                <p className="text-4xl font-black text-brand-navy">R{product.price.toFixed(2)}</p>
                <p className="text-sm font-bold text-gray-500">
                  {availableStock > 0 ? `${availableStock} available to reserve` : "No reservable stock right now"}
                </p>

                {product.stock_status === "low_stock" && (
                  <p className="flex items-center gap-2 text-sm font-semibold text-orange-600">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    Low stock. Reserve or enquire quickly.
                  </p>
                )}
                {product.stock_status === "out_of_stock" && (
                  <p className="text-sm font-semibold text-brand-red">Out of stock at this branch</p>
                )}

                {branch && product.stock_status !== "out_of_stock" && (
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setReserveOpen(true)}
                      disabled={!canReserve}
                      className="min-h-12 rounded-lg bg-brand-red px-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 active:scale-[0.98]"
                    >
                      Reserve
                    </button>
                    <WhatsAppButton href={buildWhatsAppLink(branch, product)} label={`Enquire at ${branch.name}`} size="lg" fullWidth />
                    <p className="text-center text-xs text-gray-400 sm:col-span-2">No purchase required. Reserve briefly or just ask.</p>
                  </div>
                )}

                {product.expiry_date && (
                  <p className="border-t border-gray-100 pt-3 text-xs text-gray-400">
                    Best before: {new Date(product.expiry_date).toLocaleDateString("en-ZA")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {branch && related.length > 0 && (
            <div className="mt-10">
              <ProductRow
                title={`More in ${category?.name ?? "this category"}`}
                products={related}
                branch={branch}
                viewAllHref={category ? `/category/${category.id}` : undefined}
              />
            </div>
          )}
        </div>
      </main>
      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} hidden={reserveOpen} />
      {branch && <ReserveModal open={reserveOpen} onClose={() => setReserveOpen(false)} product={product} branch={branch} />}
    </>
  );
}
