"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, Branch } from "@dismart/shared";
import ProductCard from "@/components/product/ProductCard";

interface ProductRowProps {
  title: string;
  products: Product[];
  branch: Branch;
  viewAllHref?: string;
}

export default function ProductRow({ title, products, branch, viewAllHref }: ProductRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scrollByCard(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -520 : 520,
      behavior: "smooth",
    });
  }

  return (
    <section className="max-w-7xl mx-auto px-4 my-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black text-brand-navy uppercase tracking-wide">
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-brand-red hover:underline"
          >
            View All
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => scrollByCard("left")}
          className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-navy shadow-md transition hover:border-brand-yellow md:flex"
          aria-label={`Scroll ${title} left`}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div
          ref={scrollerRef}
          onWheel={(event) => {
            if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
              event.currentTarget.scrollLeft += event.deltaY;
            }
          }}
          className="flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scroll-smooth"
        >
          {products.map((product) => (
            <div key={product.id} className="w-44 flex-shrink-0 snap-start sm:w-52">
              <ProductCard product={product} branch={branch} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollByCard("right")}
          className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-navy shadow-md transition hover:border-brand-yellow md:flex"
          aria-label={`Scroll ${title} right`}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
