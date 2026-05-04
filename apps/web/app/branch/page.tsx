"use client";

import { useState, useCallback } from "react";
import type { Branch } from "@dismart/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
import ProductGrid from "@/components/product/ProductGrid";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { getProductsByBranch } from "@/lib/mock-data";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export default function BranchPage() {
  const [branch, setBranch] = useState<Branch | null>(null);

  const handleBranchChange = useCallback((b: Branch) => {
    setBranch(b);
  }, []);

  const products = branch ? getProductsByBranch(branch.id) : [];

  return (
    <>
      <Header onBranchChange={handleBranchChange} activeBranch={branch} />
      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {branch ? (
            <>
              <div className="bg-brand-navy text-white rounded-2xl p-6 md:p-10 mb-8">
                <h1 className="text-3xl font-black text-brand-yellow uppercase">
                  {branch.name}
                </h1>
                <address className="not-italic text-gray-300 text-sm mt-2 space-y-1">
                  <p>{branch.address}</p>
                  <p>
                    <a href={`tel:${branch.phone}`} className="hover:text-brand-yellow transition-colors">
                      {branch.phone}
                    </a>
                  </p>
                </address>
                <div className="mt-4">
                  <WhatsAppButton
                    href={buildGeneralWhatsAppLink(branch)}
                    label={`Chat with ${branch.name}`}
                    size="md"
                  />
                </div>
              </div>

              <h2 className="text-xl font-black text-brand-navy uppercase tracking-wide mb-4">
                All Products at {branch.name}
              </h2>
              <ProductGrid products={products} branch={branch} />
            </>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              Detecting your branch...
            </div>
          )}
        </div>
      </main>
      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
    </>
  );
}
