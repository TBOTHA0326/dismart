"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@dismart/shared";
import CategoryIcon from "@/components/ui/CategoryIcon";

interface CategoryStripProps {
  categories: Category[];
}

export default function CategoryStrip({ categories }: CategoryStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollRail(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth",
    });
  }

  return (
    <section className="border-b border-gray-100 bg-white py-4">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollRail("left")}
            className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-navy shadow-md transition hover:border-brand-yellow md:flex"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div
            ref={scrollerRef}
            onWheel={(event) => {
              if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                event.preventDefault();
                event.currentTarget.scrollLeft += event.deltaY;
              }
            }}
            className="flex-1 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
          >
            <div className="mx-auto flex w-max min-w-full justify-start gap-4 md:justify-center md:gap-5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className="group flex w-24 flex-shrink-0 flex-col items-center gap-2"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-yellow/40 bg-brand-yellow/15 text-brand-navy transition-all group-hover:border-brand-yellow group-hover:bg-brand-yellow/30 group-hover:text-brand-red">
                    <CategoryIcon name={cat.icon_name} className="h-7 w-7" />
                  </div>
                  <span className="w-full text-center text-xs font-semibold leading-tight text-gray-700 transition-colors line-clamp-2 group-hover:text-brand-navy">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollRail("right")}
            className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-navy shadow-md transition hover:border-brand-yellow md:flex"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
