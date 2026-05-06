"use client";

import { useCallback, useEffect, useState } from "react";
import type { Branch, Category, Product } from "@dismart/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
import ProductGrid from "@/components/product/ProductGrid";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";
import { createClient } from "@/lib/supabase";

interface Props {
  branches: Branch[];
  categories: Category[];
}

export default function BranchClient({ branches, categories }: Props) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const handleBranchChange = useCallback((b: Branch) => setBranch(b), []);

  useEffect(() => {
    if (!branch) return;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("product_branches")
      .select("products(*)")
      .eq("branch_id", branch.id)
      .then(({ data }) => {
        const prods = (data ?? []).map((r: any) => r.products).filter(Boolean).map((p: any) => ({ ...p, branch_ids: [branch.id] }));
        setProducts(prods);
        setLoading(false);
      });
  }, [branch]);

  const categoriesWithProducts = categories.filter((cat) =>
    products.some((p) => p.category_id === cat.id)
  );

  const filteredProducts = activeCategoryId
    ? products.filter((p) => p.category_id === activeCategoryId)
    : products;

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <>
      <Header branches={branches} onBranchChange={handleBranchChange} activeBranch={branch} />
      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {branch ? (
            <>
              {/* Branch info card */}
              <div className="bg-brand-navy text-white rounded-2xl p-6 md:p-10 mb-6">
                <h1 className="text-3xl font-black text-brand-yellow uppercase">{branch.name}</h1>
                <address className="not-italic text-gray-300 text-sm mt-2 space-y-1">
                  <p>{branch.address}</p>
                  <p>
                    <a href={`tel:${branch.phone}`} className="hover:text-brand-yellow transition-colors">{branch.phone}</a>
                  </p>
                </address>
                <div className="mt-4">
                  <WhatsAppButton href={buildGeneralWhatsAppLink(branch)} label={`Chat with ${branch.name}`} size="md" />
                </div>
              </div>

              {/* Mobile/tablet: horizontal category filter pills */}
              {!loading && categoriesWithProducts.length > 0 && (
                <div className="md:hidden mb-4 -mx-4 px-4 overflow-x-auto scrollbar-hide scroll-smooth">
                  <div className="flex gap-2 w-max pb-2">
                    <button
                      onClick={() => setActiveCategoryId(null)}
                      className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                        !activeCategoryId
                          ? "bg-brand-navy text-brand-yellow"
                          : "bg-white border border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy"
                      }`}
                    >
                      All
                    </button>
                    {categoriesWithProducts.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategoryId(cat.id === activeCategoryId ? null : cat.id)}
                        className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                          activeCategoryId === cat.id
                            ? "bg-brand-navy text-brand-yellow"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy"
                        }`}
                      >
                        <CategoryIcon name={cat.icon_name} className="h-3.5 w-3.5" />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-6">
                {/* Desktop sidebar */}
                {!loading && categoriesWithProducts.length > 0 && (
                  <aside className="hidden md:block w-48 flex-shrink-0">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Categories</h2>
                    <nav className="flex flex-col gap-1">
                      <button
                        onClick={() => setActiveCategoryId(null)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left w-full ${
                          !activeCategoryId
                            ? "bg-brand-yellow text-brand-navy"
                            : "text-gray-600 hover:bg-gray-100 hover:text-brand-navy"
                        }`}
                      >
                        All Products
                      </button>
                      {categoriesWithProducts.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategoryId(cat.id === activeCategoryId ? null : cat.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left w-full ${
                            activeCategoryId === cat.id
                              ? "bg-brand-yellow text-brand-navy"
                              : "text-gray-600 hover:bg-gray-100 hover:text-brand-navy"
                          }`}
                        >
                          <CategoryIcon name={cat.icon_name} className="h-4 w-4" />
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </nav>
                  </aside>
                )}

                <div className="flex-1 min-w-0">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-yellow border-t-brand-navy" />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-black text-brand-navy uppercase tracking-wide mb-4">
                        {activeCategory ? activeCategory.name : `All Products at ${branch.name}`}
                      </h2>
                      <ProductGrid products={filteredProducts} branch={branch} />
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">Detecting your branch...</div>
          )}
        </div>
      </main>
      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
    </>
  );
}
