"use client";

import { useState } from "react";
import { Search, Trash2 } from "lucide-react";

export function Table({
  headers,
  rows,
  searchable,
  rowIds,
  onDeleteSelected,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  searchable?: string[];
  rowIds?: string[];
  onDeleteSelected?: (ids: string[]) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const filteredIndexes = searchable && query.trim()
    ? rows.map((_, i) => i).filter((i) => searchable[i]?.toLowerCase().includes(query.trim().toLowerCase()))
    : rows.map((_, i) => i);

  const filteredRows = filteredIndexes.map((i) => rows[i]);
  const filteredIds = rowIds ? filteredIndexes.map((i) => rowIds[i]) : [];

  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => { const next = new Set(prev); filteredIds.forEach((id) => next.delete(id)); return next; });
    } else {
      setSelected((prev) => new Set(Array.from(prev).concat(filteredIds)));
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  async function handleDeleteSelected() {
    if (!onDeleteSelected || selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} item${selected.size > 1 ? "s" : ""}?`)) return;
    setDeleting(true);
    await onDeleteSelected([...selected]);
    setSelected(new Set());
    setDeleting(false);
  }

  const showBulk = !!rowIds && !!onDeleteSelected;

  const checkbox = (checked: boolean, indeterminate: boolean, onChange: () => void, label: string) => (
    <button
      type="button"
      onClick={onChange}
      aria-label={label}
      className={`h-4 w-4 shrink-0 rounded border transition
        ${checked ? "border-brand-navy bg-brand-navy" : indeterminate ? "border-brand-navy bg-brand-navy/30" : "border-gray-300 bg-white hover:border-brand-navy"}`}
    >
      {(checked || indeterminate) && (
        <svg viewBox="0 0 10 10" className="h-full w-full text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
          {checked ? <path d="M1.5 5l2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M2 5h6" strokeLinecap="round" />}
        </svg>
      )}
    </button>
  );

  return (
    <>
      {/* Bulk action bar */}
      {showBulk && selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-brand-navy/20 bg-brand-navy/5 px-4 py-2.5">
          <span className="text-sm font-bold text-brand-navy">{selected.size} selected</span>
          <button
            onClick={handleDeleteSelected}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? "Deleting…" : "Delete selected"}
          </button>
        </div>
      )}

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

        {filteredRows.map((row, i) => {
          const id = filteredIds[i];
          const primaryCell = row[0];
          const actionCell = row[row.length - 1];
          const secondaryCells = row.slice(1, -1);
          return (
            <div key={i} className={`rounded-xl border bg-white shadow-sm overflow-hidden transition ${id && selected.has(id) ? "border-brand-navy/30" : "border-gray-100"}`}>
              {/* Primary + optional checkbox */}
              <div className="flex items-center gap-3 px-3 py-2.5">
                {showBulk && id && checkbox(selected.has(id), false, () => toggleRow(id), "Select row")}
                <div className="flex-1 min-w-0">{primaryCell}</div>
                <div className="flex shrink-0 items-center gap-1.5">{actionCell}</div>
              </div>
              {/* Secondary fields in compact 2-col grid */}
              {secondaryCells.length > 0 && (
                <div className="grid grid-cols-2 gap-px border-t border-gray-50 bg-gray-50">
                  {secondaryCells.map((cell, cellIndex) => (
                    <div key={cellIndex} className="bg-white px-3 py-1.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{headers[cellIndex + 1]}</p>
                      <div className="mt-0.5 text-xs text-gray-700">{cell}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-black uppercase tracking-widest text-gray-500">
              <tr>
                {showBulk && (
                  <th className="px-4 py-3 w-10">
                    {filteredIds.length > 0 && checkbox(allSelected, !allSelected && filteredIds.some((id) => selected.has(id)), toggleAll, "Select all")}
                  </th>
                )}
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((row, i) => {
                const id = filteredIds[i];
                const isSelected = !!id && selected.has(id);
                return (
                  <tr key={i} className={`align-top transition ${isSelected ? "bg-brand-navy/5" : ""}`}>
                    {showBulk && (
                      <td className="px-4 py-3">
                        {id && checkbox(isSelected, false, () => toggleRow(id), "Select row")}
                      </td>
                    )}
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">{cell}</td>
                    ))}
                  </tr>
                );
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={headers.length + (showBulk ? 1 : 0)} className="py-10 text-center text-sm text-gray-400">
                    {query ? "No results." : "Nothing here yet."}
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
