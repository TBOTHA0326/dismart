import type { Branch } from "@dismart/shared";

interface FooterProps {
  branch: Branch | null;
}

export default function Footer({ branch }: FooterProps) {
  return (
    <footer className="bg-brand-navy text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <div className="flex-1">
            <span className="text-3xl font-black tracking-tight">
              <span className="text-brand-yellow">DIS</span>
              <span className="text-brand-red">MART</span>
            </span>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">
              Discount salvage retail — incredible deals across Meyerton, Riversdale and Vanderbijlpark.
            </p>
          </div>

          {branch && (
            <div className="flex-1">
              <h3 className="text-brand-yellow font-bold text-sm uppercase tracking-wider mb-3">
                Your Branch — {branch.name}
              </h3>
              <address className="not-italic text-gray-300 text-sm space-y-1">
                <p>{branch.address}</p>
                <p>
                  <a href={`tel:${branch.phone}`} className="hover:text-brand-yellow transition-colors">
                    {branch.phone}
                  </a>
                </p>
              </address>
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-brand-yellow font-bold text-sm uppercase tracking-wider mb-3">
              Our Branches
            </h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>Meyerton</li>
              <li>Riversdale</li>
              <li>Vanderbijlpark</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} Dismart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
