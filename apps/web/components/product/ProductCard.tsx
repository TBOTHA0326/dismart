import Image from "next/image";
import Link from "next/link";
import { formatCurrency, type Product, type Branch } from "@dismart/shared";
import Badge from "@/components/ui/Badge";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface ProductCardProps {
  product: Product;
  branch: Branch;
}

export default function ProductCard({ product, branch }: ProductCardProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/product/${product.id}`} className="relative block aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {product.is_special && (
          <div className="absolute top-2 left-2">
            <Badge variant="special" />
          </div>
        )}
        {product.stock_status === "low_stock" && (
          <div className="absolute top-2 right-2">
            <Badge variant="low-stock" />
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-brand-navy transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-auto text-xl font-black text-brand-navy">
          {formatCurrency(product.price)}
        </p>
        <WhatsAppButton
          href={buildWhatsAppLink(branch, product)}
          label="Enquire"
          size="sm"
          fullWidth
        />
      </div>
    </div>
  );
}
