import { BadgePercent, Boxes, Building2, FileText, LayoutDashboard, Tags, Users } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/banners", label: "Banners", icon: BadgePercent },
  { href: "/deals", label: "Deals", icon: FileText },
  { href: "/branches", label: "Branches", icon: Building2 },
  { href: "/users", label: "Users", icon: Users },
];

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-brand-navy">DIS</span>
            <span className="text-brand-red">MART</span>
            <span className="ml-2 text-sm font-bold text-gray-400">CMS</span>
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        {/* Full sidebar — visible on desktop, hidden on mobile */}
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-gray-400"
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Spinner in the content area only */}
        <main className="flex flex-col items-center justify-center py-32 gap-3">
          <div className="h-9 w-9 rounded-full border-4 border-gray-200 border-t-brand-navy animate-spin" />
          <p className="text-sm font-semibold text-gray-400">Loading…</p>
        </main>
      </div>
    </div>
  );
}
