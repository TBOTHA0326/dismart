"use client";

import { MapPin, Phone } from "lucide-react";
import type { Branch } from "@dismart/shared";

interface BranchInfoSectionProps {
  branch: Branch;
  onSwitchBranch?: () => void;
}

export default function BranchInfoSection({ branch, onSwitchBranch }: BranchInfoSectionProps) {
  return (
    <section className="bg-gray-50 py-10 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-red mb-1">
              Your Branch
            </p>
            <h3 className="text-xl font-black text-brand-navy">{branch.name}</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-navy" aria-hidden="true" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 flex-shrink-0 text-brand-navy" aria-hidden="true" />
                <span>{branch.phone}</span>
              </div>
            </div>
          </div>
          {onSwitchBranch && (
            <button
              type="button"
              onClick={onSwitchBranch}
              className="self-start rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-brand-navy transition hover:border-brand-yellow hover:shadow-sm min-h-11"
            >
              Switch Branch
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
