import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@dismart/shared";

interface BannerCardProps {
  banner: Banner;
}

export default function BannerCard({ banner }: BannerCardProps) {
  const href =
    banner.link_type === "category" && banner.link_id
      ? `/category/${banner.link_id}`
      : banner.link_type === "product" && banner.link_id
      ? `/product/${banner.link_id}`
      : null;

  const inner = (
    <div
      className="relative w-full h-44 sm:h-56 md:h-64 rounded-2xl overflow-hidden flex items-center"
      style={{ backgroundColor: banner.bg_color }}
    >
      <Image
        src={banner.image_url}
        alt={banner.headline}
        fill
        className="object-cover opacity-30"
        sizes="(max-width: 1280px) 100vw, 1280px"
        priority
      />
      <div className="relative z-10 px-6 md:px-10 max-w-lg">
        <h2 className="text-white font-black text-2xl sm:text-3xl md:text-4xl leading-tight uppercase">
          {banner.headline}
        </h2>
        {banner.subtext && (
          <p className="text-white/80 text-sm sm:text-base mt-2">{banner.subtext}</p>
        )}
        {href && (
          <span className="inline-block mt-4 bg-brand-yellow text-brand-navy font-bold px-5 py-2 rounded-lg text-sm hover:bg-brand-yellow-dark transition-colors">
            Shop Now
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 my-4">
      {href ? <Link href={href}>{inner}</Link> : inner}
    </div>
  );
}
