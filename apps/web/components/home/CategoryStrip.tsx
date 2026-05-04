import Link from "next/link";
import type { Category } from "@dismart/shared";

interface CategoryStripProps {
  categories: Category[];
}

export default function CategoryStrip({ categories }: CategoryStripProps) {
  return (
    <section className="bg-white border-b border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-16 h-16 rounded-full bg-brand-yellow/10 border-2 border-brand-yellow/20 group-hover:border-brand-yellow group-hover:bg-brand-yellow/20 transition-all flex items-center justify-center text-3xl">
                {cat.icon_emoji}
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-brand-navy text-center w-16 leading-tight line-clamp-2 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
