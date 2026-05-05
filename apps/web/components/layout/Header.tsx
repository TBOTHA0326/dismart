"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Search } from "lucide-react";
import type { Branch } from "@dismart/shared";
import {
  detectNearestBranch,
  getSavedBranchId,
  saveBranchId,
} from "@/lib/branch";

interface HeaderProps {
  branches: Branch[];
  onBranchChange: (branch: Branch) => void;
  activeBranch: Branch | null;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function Header({
  branches,
  onBranchChange,
  activeBranch,
  searchValue = "",
  onSearchChange,
}: HeaderProps) {
  const [detecting, setDetecting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (branches.length === 0) return;

    const saved = getSavedBranchId();
    if (saved) {
      const branch = branches.find((b) => b.id === saved);
      if (branch) { onBranchChange(branch); return; }
    }

    // Fall back to first branch immediately, then try geolocation
    onBranchChange(branches[0]);
    saveBranchId(branches[0].id);

    setDetecting(true);
    detectNearestBranch(branches).then((branch) => {
      saveBranchId(branch.id);
      onBranchChange(branch);
      setDetecting(false);
    });
  }, [branches, onBranchChange]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectBranch(branch: Branch) {
    saveBranchId(branch.id);
    onBranchChange(branch);
    setDropdownOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-brand-yellow shadow-sm">
      <div className="mx-auto grid min-h-16 max-w-7xl grid-cols-1 gap-3 px-4 py-3 md:min-h-20 md:grid-cols-[220px_minmax(320px,720px)_220px] md:items-center">
        <div className="flex items-center gap-4 justify-self-start">
          <Link href="/" aria-label="Dismart home">
            <span className="text-2xl font-black tracking-tight leading-none">
              <span className="text-brand-navy">DIS</span>
              <span className="text-brand-red">MART</span>
            </span>
          </Link>
          <Link
            href="/branch"
            className="hidden md:inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-navy/70 transition hover:bg-brand-navy/10 hover:text-brand-navy"
          >
            Browse All
          </Link>
        </div>

        {onSearchChange && (
          <label className="relative w-full justify-self-center">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-navy/45" aria-hidden="true" />
            <input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, categories or specials"
              className="h-11 w-full rounded-lg border border-white/70 bg-white pl-10 pr-4 text-sm font-medium text-brand-navy outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
              type="search"
            />
          </label>
        )}

        <div className="relative justify-self-start md:justify-self-end" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex h-11 items-center gap-2 rounded-lg bg-white/35 px-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-white/55 active:bg-white/70"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{detecting ? "Detecting..." : activeBranch?.name ?? "Select Branch"}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl z-50" role="listbox">
              {branches.filter((b) => b.is_active).map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => selectBranch(branch)}
                  role="option"
                  aria-selected={activeBranch?.id === branch.id}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                    activeBranch?.id === branch.id ? "bg-brand-yellow text-brand-navy" : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <MapPin className="h-4 w-4 flex-shrink-0 text-brand-red" aria-hidden="true" />
                  {branch.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
