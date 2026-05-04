interface BadgeProps {
  variant?: "special" | "low-stock";
}

export default function Badge({ variant = "special" }: BadgeProps) {
  if (variant === "low-stock") {
    return (
      <span className="inline-block bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
        Low Stock
      </span>
    );
  }
  return (
    <span className="inline-block bg-brand-red text-white text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
      Special
    </span>
  );
}
