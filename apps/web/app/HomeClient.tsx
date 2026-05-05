"use client";

import { useCallback, useEffect, useState } from "react";
import type { Banner, Branch, Category, DealPamphlet, Product } from "@dismart/shared";
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
import { createClient } from "@/lib/supabase";

interface BranchData {
  products: Product[];
  banners: Banner[];
  deals: DealPamphlet[];
}

interface Props {
  branches: Branch[];
  categories: Category[];
}

export default function HomeClient({ branches, categories }: Props) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<BranchData>({ products: [], banners: [], deals: [] });
  const [loading, setLoading] = useState(false);

  const handleBranchChange = useCallback((b: Branch) => {
    setBranch(b);
  }, []);

  useEffect(() => {
    if (!branch) return;
    setLoading(true);

    const supabase = createClient();
    Promise.all([
      supabase
        .from("product_branches")
        .select("products(*)")
        .eq("branch_id", branch.id),
      supabase
        .from("banners")
        .select("*")
        .eq("branch_id", branch.id)
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("deal_pamphlets")
        .select("*")
        .eq("branch_id", branch.id)
        .eq("is_active", true)
        .order("sort_order"),
    ]).then(([{ data: pbData }, { data: banners }, { data: deals }]) => {
      const products = (pbData ?? [])
        .map((row: any) => row.products)
        .filter(Boolean)
        .map((p: any) => ({ ...p, branch_ids: [branch.id] }));

      setData({
        products,
        banners: (banners ?? []) as Banner[],
        deals: (deals ?? []) as DealPamphlet[],
      });
      setLoading(false);
    });
  }, [branch]);

  const { products, banners, deals } = data;
  const specials = products.filter((p) => p.is_special);
  const searchTerm = search.trim().toLowerCase();

  const searchedProducts = branch && searchTerm
    ? products.filter((p) => {
        const cat = categories.find((c) => c.id === p.category_id);
        return [p.name, p.description, cat?.name ?? ""].join(" ").toLowerCase().includes(searchTerm);
      })
    : [];

  const categoriesWithProducts = branch
    ? categories
        .map((cat) => ({
          cat,
          catProducts: products.filter((p) => p.category_id === cat.id),
        }))
        .filter(({ catProducts }) => catProducts.length > 0)
    : [];

  return (
    <>
      <Header
        branches={branches}
        onBranchChange={handleBranchChange}
        activeBranch={branch}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <CategoryStrip categories={categories} />

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-yellow border-t-brand-navy" />
          </div>
        )}

        {!loading && branch && searchTerm ? (
          <section className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-red">Search results</p>
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
        ) : !loading && (
          <>
            <DealsFeature deals={deals} />
            <div className="flex justify-center px-4 py-4 md:hidden">
              <a
                href="/branch"
                className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-8 py-3 text-sm font-bold uppercase tracking-widest text-brand-yellow shadow-md transition hover:bg-brand-yellow hover:text-brand-navy"
              >
                View All Products
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
            {banners[0] && <BannerCard banner={banners[0]} />}
            {branch && specials.length > 0 && (
              <ProductRow title="Today's Specials" products={specials} branch={branch} />
            )}
            {banners[1] && <BannerCard banner={banners[1]} />}
            {branch && categoriesWithProducts.map(({ cat, catProducts }, index) => (
              <div key={cat.id}>
                <ProductRow
                  title={cat.name}
                  products={catProducts}
                  branch={branch}
                  viewAllHref={`/category/${cat.id}`}
                />
                {index >= 2 && (index - 2) % 3 === 0 && banners[Math.floor((index - 2) / 3) + 2] && (
                  <BannerCard banner={banners[Math.floor((index - 2) / 3) + 2]} />
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
