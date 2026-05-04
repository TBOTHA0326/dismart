"use client";

import { useCallback, useState } from "react";
import type { Branch } from "@dismart/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
import CategoryStrip from "@/components/home/CategoryStrip";
import BannerCard from "@/components/home/BannerCard";
import DealsFeature from "@/components/home/DealsFeature";
import ProductRow from "@/components/home/ProductRow";
import ProductGrid from "@/components/product/ProductGrid";
import WhatsAppCTABanner from "@/components/home/WhatsAppCTABanner";
import BranchInfoSection from "@/components/home/BranchInfoSection";
import {
  CATEGORIES,
  getBannersByBranch,
  getDealsByBranch,
  getProductsByBranch,
  getProductsByCategory,
  getSpecialsByBranch,
} from "@/lib/mock-data";

export default function HomePage() {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [search, setSearch] = useState("");

  const handleBranchChange = useCallback((b: Branch) => {
    setBranch(b);
  }, []);

  const banners = branch ? getBannersByBranch(branch.id) : [];
  const deals = branch ? getDealsByBranch(branch.id) : [];
  const specials = branch ? getSpecialsByBranch(branch.id) : [];
  const searchTerm = search.trim().toLowerCase();
  const searchedProducts =
    branch && searchTerm
      ? getProductsByBranch(branch.id).filter((product) => {
          const category = CATEGORIES.find((cat) => cat.id === product.category_id);
          return [product.name, product.description, category?.name ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm);
        })
      : [];

  const categoriesWithProducts = branch
    ? CATEGORIES.filter(
        (cat) => getProductsByCategory(branch.id, cat.id).length > 0
      ).sort((a, b) => a.sort_order - b.sort_order)
    : [];

  return (
    <>
      <Header
        onBranchChange={handleBranchChange}
        activeBranch={branch}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <CategoryStrip categories={CATEGORIES} />

        {branch && searchTerm ? (
          <section className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
                  Search results
                </p>
                <h1 className="text-2xl font-black text-brand-navy">
                  {searchedProducts.length} products for &quot;{search.trim()}&quot;
                </h1>
              </div>
              <button
                onClick={() => setSearch("")}
                className="min-h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-brand-navy transition hover:border-brand-yellow"
              >
                Clear Search
              </button>
            </div>
            <ProductGrid products={searchedProducts} branch={branch} />
          </section>
        ) : (
          <>
            <DealsFeature deals={deals} />

            {banners[0] && <BannerCard banner={banners[0]} />}

            {branch && specials.length > 0 && (
              <ProductRow title="Today's Specials" products={specials} branch={branch} />
            )}

            {banners[1] && <BannerCard banner={banners[1]} />}

            {branch &&
              categoriesWithProducts.map((cat, index) => (
                <div key={cat.id}>
                  <ProductRow
                    title={cat.name}
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

          </>
        )}
      </main>

      {branch && <WhatsAppCTABanner branch={branch} />}
      {branch && <BranchInfoSection branch={branch} />}

      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
    </>
  );
}
