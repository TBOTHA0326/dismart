"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Branch, Category, Product } from "@dismart/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
import ProductGrid from "@/components/product/ProductGrid";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { createClient } from "@/lib/supabase";

interface Props {
  categoryId: string;
  category: Category | null;
  branches: Branch[];
  categories: Category[];
}

export default function CategoryClient({ categoryId, category, branches, categories }: Props) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

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
        const prods = (data ?? [])
          .map((r: any) => r.products)
          .filter((p: any) => p && p.category_id === categoryId)
          .map((p: any) => ({ ...p, branch_ids: [branch.id] }));
        setProducts(prods);
        setLoading(false);
      });
  }, [branch, categoryId]);

  return (
    <>
      <Header branches={branches} onBranchChange={handleBranchChange} activeBranch={branch} />
      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
            <span>/</span>
            <span className="text-brand-navy font-semibold">{category?.name ?? "Category"}</span>
          </nav>

          {category && (
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-black text-brand-navy uppercase tracking-wide">{category.name}</h1>
              {branch && <p className="text-gray-500 text-sm mt-1">Showing products at {branch.name}</p>}
            </div>
          )}

          <div className="flex gap-6">
            <aside className="hidden md:block w-48 flex-shrink-0">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Categories</h2>
              <nav className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      cat.id === categoryId ? "bg-brand-yellow text-brand-navy" : "text-gray-600 hover:bg-gray-100 hover:text-brand-navy"
                    }`}
                  >
                    <CategoryIcon name={cat.icon_name} className="h-4 w-4" />
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </nav>
            </aside>

            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-yellow border-t-brand-navy" />
                </div>
              ) : branch ? (
                <ProductGrid products={products} branch={branch} />
              ) : (
                <p className="text-gray-400 text-sm py-8 text-center">Detecting your branch...</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
    </>
  );
}
