import { BadgePercent, ExternalLink, FileText } from "lucide-react";
import type { DealPamphlet } from "@dismart/shared";

interface DealsFeatureProps {
  deals: DealPamphlet[];
}

export default function DealsFeature({ deals }: DealsFeatureProps) {
  if (deals.length === 0) return null;

  const featured = deals[0];
  const isPdf = featured.asset_type === "pdf";

  return (
    <section className="mx-auto max-w-7xl px-4 py-5">
      <div className="grid overflow-hidden rounded-lg border border-brand-yellow/50 bg-white shadow-sm md:grid-cols-[1.1fr_1.4fr]">
        <div className="flex flex-col justify-center gap-4 bg-brand-navy p-6 text-white md:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-yellow text-brand-navy">
            <BadgePercent className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-yellow">
              Specials and Deals
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight md:text-3xl">
              {featured.title}
            </h2>
            {featured.description && (
              <p className="mt-2 text-sm text-white/75">{featured.description}</p>
            )}
          </div>
          <a
            href={featured.asset_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-brand-yellow px-4 text-sm font-black text-brand-navy transition hover:bg-brand-yellow-dark"
          >
            {isPdf ? (
              <FileText className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            )}
            {isPdf ? "Open Pamphlet" : "View Deals"}
          </a>
        </div>
        <a
          href={featured.asset_url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block min-h-56 bg-gray-100"
        >
          {featured.thumbnail_url ? (
            <img
              src={featured.thumbnail_url}
              alt={featured.title}
              className="h-full min-h-56 w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-56 items-center justify-center text-brand-navy">
              <FileText className="h-16 w-16" aria-hidden="true" />
            </div>
          )}
        </a>
      </div>
    </section>
  );
}
