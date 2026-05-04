"use client";

import { useState, useCallback } from "react";
import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Branch } from "@dismart/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
import Badge from "@/components/ui/Badge";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import ProductRow from "@/components/home/ProductRow";
import {
  getProductById,
  getCategoryById,
  getProductsByCategory,
} from "@/lib/mock-data";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: PageProps) {
  const { id } = use(params);
  const [branch, setBranch] = useState<Branch | null>(null);

  const handleBranchChange = useCallback((b: Branch) => {
    setBranch(b);
  }, []);

  const product = getProductById(id);
  const category = product ? getCategoryById(product.category_id) : null;
  const related = branch && product
    ? getProductsByCategory(branch.id, product.category_id)
        .filter((p) => p.id !== product.id)
        .slice(0, 8)
    : [];

  return (
    <>
      <Header onBranchChange={handleBranchChange} activeBranch={branch} />
      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
            <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  href={`/category/${category.id}`}
                  className="hover:text-brand-navy transition-colors"
                >
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-brand-navy font-semibold line-clamp-1">
              {product?.name ?? "Product"}
            </span>
          </nav>

          {!product ? (
            <p className="text-gray-500 text-center py-20">Product not found.</p>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative aspect-square md:w-96 md:flex-shrink-0 bg-gray-50">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 384px"
                      priority
                    />
                    {product.is_special && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="special" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8 flex flex-col gap-4 flex-1">
                    {category && (
                      <Link
                        href={`/category/${category.id}`}
                        className="text-xs font-bold text-brand-red uppercase tracking-widest hover:underline"
                      >
                        {category.icon_emoji} {category.name}
                      </Link>
                    )}
                    <h1 className="text-2xl md:text-3xl font-black text-brand-navy leading-tight">
                      {product.name}
                    </h1>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {product.description}
                    </p>
                    <p className="text-4xl font-black text-brand-navy">
                      R{product.price.toFixed(2)}
                    </p>

                    {product.stock_status === "low_stock" && (
                      <p className="text-orange-600 text-sm font-semibold">
                        &#9888; Low stock — enquire quickly!
                      </p>
                    )}
                    {product.stock_status === "out_of_stock" && (
                      <p className="text-brand-red text-sm font-semibold">
                        Out of stock at this branch
                      </p>
                    )}

                    {branch && product.stock_status !== "out_of_stock" && (
                      <div className="mt-2">
                        <WhatsAppButton
                          href={buildWhatsAppLink(branch, product)}
                          label={`Enquire at ${branch.name}`}
                          size="lg"
                          fullWidth
                        />
                        <p className="text-xs text-gray-400 text-center mt-2">
                          No purchase required — just ask!
                        </p>
                      </div>
                    )}

                    {product.expiry_date && (
                      <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
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
            </>
          )}
        </div>
      </main>
      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
    </>
  );
}
