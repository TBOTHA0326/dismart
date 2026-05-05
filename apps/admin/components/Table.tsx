"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export function Table({
  headers,
  rows,
  searchable,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  searchable?: string[];
}) {
  const [query, setQuery] = useState("");

  const filteredRows = searchable && query.trim()
    ? rows.filter((_, i) => searchable[i]?.toLowerCase().includes(query.trim().toLowerCase()))
    : rows;

  return (
    <>
      {/* Mobile: search + card list */}
      <div className="space-y-3 md:hidden">
        {searchable && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
            />
          </div>
        )}

        {filteredRows.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            {query ? "No results." : "Nothing here yet."}
          </p>
        )}

        {filteredRows.map((row, rowIndex) => (
          <div key={rowIndex} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {row.map((cell, cellIndex) => {
              const isActions = cellIndex === row.length - 1;
              if (isActions) {
                return (
                  <div key={cellIndex} className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
                    {cell}
                  </div>
                );
              }
              return (
                <div key={cellIndex} className="flex items-start gap-3 px-4 py-2.5 border-b border-gray-50 last:border-b-0">
                  <span className="w-24 flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-gray-400 pt-0.5">
                    {headers[cellIndex]}
                  </span>
                  <span className="flex-1 text-sm text-gray-800">{cell}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-black uppercase tracking-widest text-gray-500">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="align-top">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">{cell}</td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={headers.length} className="py-10 text-center text-sm text-gray-400">
                    Nothing here yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
