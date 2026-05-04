import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
}

export default function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-500">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow/20 text-brand-navy">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="text-3xl font-black text-brand-navy">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{detail}</p>
    </div>
  );
}
