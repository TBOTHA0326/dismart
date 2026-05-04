"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import type { Branch } from "@dismart/shared";
import { BRANCHES } from "@/lib/mock-data";
import { detectNearestBranch, getSavedBranchId, saveBranchId } from "@/lib/branch";

interface HeaderProps {
  onBranchChange: (branch: Branch) => void;
  activeBranch: Branch | null;
}

export default function Header({ onBranchChange, activeBranch }: HeaderProps) {
  const [detecting, setDetecting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = getSavedBranchId();
    if (saved) {
      const branch = BRANCHES.find((b) => b.id === saved);
      if (branch) {
        onBranchChange(branch);
        return;
      }
    }
    setDetecting(true);
    detectNearestBranch().then((branch) => {
      saveBranchId(branch.id);
      onBranchChange(branch);
      setDetecting(false);
    });
  }, [onBranchChange]);

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
    <header className="bg-brand-yellow sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex-shrink-0">
          <span className="text-2xl font-black tracking-tight leading-none">
            <span className="text-brand-navy">DIS</span>
            <span className="text-brand-red">MART</span>
          </span>
        </Link>

        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-1.5 bg-white/30 hover:bg-white/50 active:bg-white/60 rounded-lg px-3 py-1.5 text-brand-navy font-semibold text-sm transition-colors"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
            <span>
              {detecting ? "Detecting..." : activeBranch?.name ?? "Select Branch"}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50" role="listbox">
              {BRANCHES.filter((b) => b.is_active).map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => selectBranch(branch)}
                  role="option"
                  aria-selected={activeBranch?.id === branch.id}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeBranch?.id === branch.id
                      ? "bg-brand-yellow text-brand-navy"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand-red flex-shrink-0" aria-hidden="true">
                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                  </svg>
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
