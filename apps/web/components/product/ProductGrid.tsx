import type { Product, Branch } from "@dismart/shared";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  branch: Branch;
}

export default function ProductGrid({ products, branch }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-8 text-center">
        No products available at this branch right now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} branch={branch} />
      ))}
    </div>
  );
}
