import type { Branch } from "@dismart/shared";

interface FooterProps {
  branch: Branch | null;
}

export default function Footer({ branch }: FooterProps) {
  return (
    <footer className="mt-12 bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="flex-1">
            <span className="text-3xl font-black tracking-tight">
              <span className="text-brand-yellow">DIS</span>
              <span className="text-brand-red">MART</span>
            </span>
            <p className="mt-2 max-w-xs text-sm text-gray-400">
              Discount salvage retail with fast-moving deals across Meyerton,
              Riversdale and Vanderbijlpark.
            </p>
          </div>

          {branch && (
            <div className="flex-1">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-yellow">
                Your Branch: {branch.name}
              </h3>
              <address className="space-y-1 text-sm not-italic text-gray-300">
                <p>{branch.address}</p>
                <p>
                  <a
                    href={`tel:${branch.phone}`}
                    className="transition-colors hover:text-brand-yellow"
                  >
                    {branch.phone}
                  </a>
                </p>
              </address>
            </div>
          )}

          <div className="flex-1">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-yellow">
              Our Branches
            </h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>Meyerton</li>
              <li>Riversdale</li>
              <li>Vanderbijlpark</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Dismart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
