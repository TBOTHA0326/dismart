import Link from "next/link";
import type { Product, Branch } from "@dismart/shared";
import ProductCard from "@/components/product/ProductCard";

interface ProductRowProps {
  title: string;
  products: Product[];
  branch: Branch;
  viewAllHref?: string;
}

export default function ProductRow({ title, products, branch, viewAllHref }: ProductRowProps) {
  if (products.length === 0) return null;

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
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-40 sm:w-48">
            <ProductCard product={product} branch={branch} />
          </div>
        ))}
      </div>
    </section>
  );
}
