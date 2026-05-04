"use client";

import { useState, useCallback } from "react";
import type { Branch } from "@dismart/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
import CategoryStrip from "@/components/home/CategoryStrip";
import BannerCard from "@/components/home/BannerCard";
import ProductRow from "@/components/home/ProductRow";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import {
  CATEGORIES,
  getBannersByBranch,
  getSpecialsByBranch,
  getProductsByCategory,
} from "@/lib/mock-data";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export default function HomePage() {
  const [branch, setBranch] = useState<Branch | null>(null);

  const handleBranchChange = useCallback((b: Branch) => {
    setBranch(b);
  }, []);

  const banners = branch ? getBannersByBranch(branch.id) : [];
  const specials = branch ? getSpecialsByBranch(branch.id) : [];

  const categoriesWithProducts = branch
    ? CATEGORIES.filter(
        (cat) => getProductsByCategory(branch.id, cat.id).length > 0
      ).sort((a, b) => a.sort_order - b.sort_order)
    : [];

  return (
    <>
      <Header onBranchChange={handleBranchChange} activeBranch={branch} />

      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <CategoryStrip categories={CATEGORIES} />

        {banners[0] && <BannerCard banner={banners[0]} />}

        {branch && specials.length > 0 && (
          <ProductRow
            title="Today's Specials"
            products={specials}
            branch={branch}
          />
        )}

        {banners[1] && <BannerCard banner={banners[1]} />}

        {branch &&
          categoriesWithProducts.map((cat, index) => (
            <div key={cat.id}>
              <ProductRow
                title={`${cat.icon_emoji} ${cat.name}`}
                products={getProductsByCategory(branch.id, cat.id)}
                branch={branch}
                viewAllHref={`/category/${cat.id}`}
              />
              {index >= 2 &&
                (index - 2) % 3 === 0 &&
                banners[Math.floor((index - 2) / 3) + 2] && (
                  <BannerCard
                    banner={banners[Math.floor((index - 2) / 3) + 2]}
                  />
                )}
            </div>
          ))}

        {branch && (
          <div className="bg-brand-yellow mx-4 md:mx-auto max-w-7xl rounded-2xl p-6 md:p-10 my-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-brand-navy font-black text-xl md:text-2xl">
                Can&apos;t find what you&apos;re looking for?
              </h2>
              <p className="text-brand-navy/70 text-sm mt-1">
                Chat directly with our {branch.name} team — we&apos;ll help you find it.
              </p>
            </div>
            <WhatsAppButton
              href={buildGeneralWhatsAppLink(branch)}
              label={`Chat with ${branch.name}`}
              size="lg"
            />
          </div>
        )}
      </main>

      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
    </>
  );
}
