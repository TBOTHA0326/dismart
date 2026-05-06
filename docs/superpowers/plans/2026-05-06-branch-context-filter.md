# Branch Context Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global branch context selector for admins/super_admins that filters all CMS data (dashboard stats, products, reservations, banners, deals) to a selected branch or "All Branches", while locking branch_managers to their assigned branch with no ability to switch.

**Architecture:** A React context (`BranchContext`) stored in `AdminShell` provides the selected branch ID (or `null` for "All Branches") to all client pages. Each server-rendered page already receives `profile` — branch_managers get their `profile.branch_id` auto-applied server-side; admins/super_admins pass their selected branch through a URL search param (`?branch=<id>`) so pages remain server-renderable and shareable. The branch selector UI lives in the `AdminShell` header, visible only to admin/super_admin.

**Tech Stack:** Next.js App Router, TypeScript, Supabase, Tailwind CSS

---

## File Map

| File | Change |
|---|---|
| `apps/admin/components/AdminShell.tsx` | Add branch selector UI in header; pass `branches` + `activeBranchId` props |
| `apps/admin/app/layout.tsx` | Fetch branches server-side, pass to AdminShell (or fetch in each page) |
| `apps/admin/app/page.tsx` | Apply branch filter to all stats queries |
| `apps/admin/app/DashboardClient.tsx` | Remove branch health section for branch_manager; show active branch label |
| `apps/admin/app/products/page.tsx` | Apply branch filter |
| `apps/admin/app/products/ProductsClient.tsx` | No change needed (already filtered server-side) |
| `apps/admin/app/reservations/page.tsx` | Apply branch filter |
| `apps/admin/app/reservations/ReservationsClient.tsx` | No change needed |
| `apps/admin/app/banners/page.tsx` | Apply branch filter |
| `apps/admin/app/banners/BannersClient.tsx` | No change needed |
| `apps/admin/app/deals/page.tsx` | Apply branch filter |
| `apps/admin/app/deals/DealsClient.tsx` | No change needed |
| `apps/admin/app/categories/page.tsx` | Categories are global (no branch); no filter needed |

**Approach:** Use URL search param `?branch=<id>` (or absent = "All Branches") as the source of truth. The `AdminShell` reads this param client-side and renders the selector. Navigating with the selector appends/updates the param. Branch managers never see the selector and their `profile.branch_id` is always injected server-side regardless of any URL param.

---

## Task 1: Add branch selector to AdminShell header

**Files:**
- Modify: `apps/admin/components/AdminShell.tsx`

The selector is only visible to `admin` and `super_admin`. It reads the current `?branch=` param from the URL and pushes a new URL when changed. Branch managers never see it — their context is implicit.

- [ ] **Step 1: Add `branches` and `activeBranchId` props to AdminShell**

Replace the existing `Props` interface and component signature at the top of `AdminShell.tsx`:

```tsx
interface Props {
  children: React.ReactNode;
  role?: Profile["role"];
  branches?: { id: string; name: string }[];
  activeBranchId?: string | null; // null = All Branches
}

export default function AdminShell({
  children,
  role = "branch_manager",
  branches = [],
  activeBranchId,
}: Props) {
```

- [ ] **Step 2: Add branch selector UI in the header**

Inside the `<div className="flex items-center gap-2">` in the header (before the sign-out button), add:

```tsx
{(role === "super_admin" || role === "admin") && branches.length > 0 && (
  <BranchSelector branches={branches} activeBranchId={activeBranchId ?? null} />
)}
```

- [ ] **Step 3: Create the BranchSelector sub-component at the bottom of AdminShell.tsx**

Add this after the `AdminShell` function export:

```tsx
function BranchSelector({
  branches,
  activeBranchId,
}: {
  branches: { id: string; name: string }[];
  activeBranchId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams();
    if (value) params.set("branch", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={activeBranchId ?? ""}
      onChange={handleChange}
      className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-brand-navy outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
      aria-label="Select branch"
    >
      <option value="">All Branches</option>
      {branches.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```powershell
cd apps/admin; npx tsc --noEmit
```

Expected: no errors related to AdminShell.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/components/AdminShell.tsx
git commit -m "feat(admin): add branch selector UI to AdminShell header"
```

---

## Task 2: Wire branch selector into Dashboard page

**Files:**
- Modify: `apps/admin/app/page.tsx`
- Modify: `apps/admin/app/DashboardClient.tsx`

The dashboard server page reads `?branch=` from `searchParams`, resolves the active branch ID (or null for "All Branches"), fetches branches list, applies branch filters to all queries, and passes everything down to `DashboardClient`. The client renders the selector via `AdminShell`.

- [ ] **Step 1: Update `apps/admin/app/page.tsx` to accept searchParams and apply branch filter**

Replace the entire file content:

```tsx
import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("./DashboardClient"), { ssr: false });

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { branch?: string };
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();

  // Resolve active branch: branch_managers are locked to their own branch
  const isBranchManager = profile.role === "branch_manager";
  const activeBranchId: string | null = isBranchManager
    ? (profile.branch_id ?? null)
    : (searchParams.branch ?? null) || null;

  const [
    { data: products },
    { data: deals },
    { data: bannersRaw },
    { data: branches },
    { data: reservations },
    { data: categories },
    { data: productBranches },
  ] = await Promise.all([
    supabase.from("products").select("id, is_special, expiry_date, stock_status"),
    activeBranchId
      ? supabase.from("deal_pamphlets").select("id, is_active").eq("branch_id", activeBranchId)
      : supabase.from("deal_pamphlets").select("id, is_active"),
    activeBranchId
      ? supabase.from("banners").select("id, headline, branch_id, is_active, sort_order").eq("branch_id", activeBranchId)
      : supabase.from("banners").select("id, headline, branch_id, is_active, sort_order"),
    supabase.from("branches").select("id, name, is_active"),
    activeBranchId
      ? supabase.from("reservations").select("id, status, created_at, branch_id").eq("branch_id", activeBranchId)
      : supabase.from("reservations").select("id, status, created_at, branch_id"),
    supabase.from("categories").select("id"),
    activeBranchId
      ? supabase.from("product_branches").select("product_id, branch_id").eq("branch_id", activeBranchId)
      : supabase.from("product_branches").select("product_id, branch_id"),
  ]);

  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Product stats: filter by branch via product_branches join
  const branchProductIds = new Set((productBranches ?? []).map((pb) => pb.product_id));
  const filteredProducts = activeBranchId
    ? (products ?? []).filter((p) => branchProductIds.has(p.id))
    : (products ?? []);

  const branchProductCounts = (branches ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    is_active: b.is_active,
    productCount: (productBranches ?? []).filter((pb) => pb.branch_id === b.id).length,
  }));

  // For branch_manager: only show their branch in the branch health list
  const visibleBranches = isBranchManager
    ? branchProductCounts.filter((b) => b.id === profile.branch_id)
    : branchProductCounts;

  return (
    <DashboardClient
      profile={profile}
      branches={branches ?? []}
      activeBranchId={activeBranchId}
      productCount={filteredProducts.length}
      specialCount={filteredProducts.filter((p) => p.is_special).length}
      expiringCount={
        filteredProducts.filter((p) => {
          if (!p.expiry_date) return false;
          const d = new Date(p.expiry_date);
          return d >= now && d <= sevenDays;
        }).length
      }
      outOfStockCount={filteredProducts.filter((p) => p.stock_status === "out_of_stock").length}
      dealCount={deals?.length ?? 0}
      activeDealCount={deals?.filter((d) => d.is_active).length ?? 0}
      categoryCount={categories?.length ?? 0}
      pendingReservations={reservations?.filter((r) => r.status === "PENDING").length ?? 0}
      todayReservations={
        reservations?.filter((r) => {
          const d = new Date(r.created_at);
          return d.toDateString() === now.toDateString();
        }).length ?? 0
      }
      totalReservations={reservations?.length ?? 0}
      activeBannerCount={(bannersRaw ?? []).filter((b) => b.is_active).length}
      banners={(bannersRaw ?? []).filter((b) => b.is_active).slice(0, 5)}
      branchStats={visibleBranches}
    />
  );
}
```

- [ ] **Step 2: Update `DashboardClient.tsx` props interface and AdminShell call**

Replace the `Props` interface and the top of the component to use `branches` (for the selector) and `branchStats` (for branch health display), and `activeBranchId`:

```tsx
interface BranchStat {
  id: string;
  name: string;
  is_active: boolean;
  productCount: number;
}

interface Props {
  profile: Profile;
  branches: { id: string; name: string }[];
  activeBranchId: string | null;
  productCount: number;
  specialCount: number;
  expiringCount: number;
  outOfStockCount: number;
  dealCount: number;
  activeDealCount: number;
  categoryCount: number;
  pendingReservations: number;
  todayReservations: number;
  totalReservations: number;
  activeBannerCount: number;
  banners: { id: string; headline: string; branch_id: string; is_active: boolean; sort_order: number }[];
  branchStats: BranchStat[];
}
```

- [ ] **Step 3: Update `DashboardClient` component signature and AdminShell usage**

Replace the function signature and `AdminShell` usage in `DashboardClient.tsx`:

```tsx
export default function DashboardClient({
  profile,
  branches,
  activeBranchId,
  productCount,
  specialCount,
  expiringCount,
  outOfStockCount,
  dealCount,
  activeDealCount,
  categoryCount,
  pendingReservations,
  todayReservations,
  totalReservations,
  activeBannerCount,
  banners,
  branchStats,
}: Props) {
  const activeBranches = branchStats.filter((b) => b.is_active);

  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
```

- [ ] **Step 4: Replace `branches` with `branchStats` in the Branch Health section of DashboardClient**

In the Branch Health card, replace all references to `branches` with `branchStats`:

```tsx
<p className="mt-0.5 text-sm text-gray-500">{activeBranches.length} active branch{activeBranches.length !== 1 ? "es" : ""}</p>
...
{branchStats.map((branch) => (
```

- [ ] **Step 5: Verify TypeScript compiles**

```powershell
cd apps/admin; npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/admin/app/page.tsx apps/admin/app/DashboardClient.tsx
git commit -m "feat(admin): wire branch filter into dashboard stats"
```

---

## Task 3: Apply branch filter to Products page

**Files:**
- Modify: `apps/admin/app/products/page.tsx`
- Modify: `apps/admin/app/products/ProductsClient.tsx`

Products are linked to branches via `product_branches`. When a branch is selected, only products that have an entry in `product_branches` for that branch are shown. Branch managers are locked to their own branch automatically.

- [ ] **Step 1: Update `apps/admin/app/products/page.tsx`**

Replace the entire file:

```tsx
import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { branch?: string };
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();

  const isBranchManager = profile.role === "branch_manager";
  const activeBranchId: string | null = isBranchManager
    ? (profile.branch_id ?? null)
    : (searchParams.branch ?? null) || null;

  const [{ data: productsRaw }, { data: categories }, { data: branches }] = await Promise.all([
    activeBranchId
      ? supabase
          .from("products")
          .select("*, product_branches!inner(branch_id)")
          .eq("product_branches.branch_id", activeBranchId)
          .order("created_at", { ascending: false })
      : supabase
          .from("products")
          .select("*, product_branches(branch_id)")
          .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("branches").select("*").eq("is_active", true),
  ]);

  const normalised = (productsRaw ?? []).map((p: any) => ({
    ...p,
    branch_ids: (p.product_branches ?? []).map((pb: any) => pb.branch_id),
  }));

  return (
    <ProductsClient
      profile={profile}
      branches={branches ?? []}
      activeBranchId={activeBranchId}
      initialProducts={normalised}
      categories={categories ?? []}
    />
  );
}
```

- [ ] **Step 2: Update `ProductsClient.tsx` to accept and forward `activeBranchId` and `branches` to AdminShell**

Add `activeBranchId` and update `branches` type in the Props interface, and update the `AdminShell` call:

```tsx
interface Props {
  profile: Profile;
  initialProducts: Product[];
  categories: Category[];
  branches: Branch[];
  activeBranchId: string | null;
}

export default function ProductsClient({ profile, initialProducts, categories, branches, activeBranchId }: Props) {
```

And update the `AdminShell` usage:

```tsx
  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
```

- [ ] **Step 3: Verify TypeScript compiles**

```powershell
cd apps/admin; npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/app/products/page.tsx apps/admin/app/products/ProductsClient.tsx
git commit -m "feat(admin): apply branch filter to products page"
```

---

## Task 4: Apply branch filter to Reservations page

**Files:**
- Modify: `apps/admin/app/reservations/page.tsx`
- Modify: `apps/admin/app/reservations/ReservationsClient.tsx`

Reservations have a `branch_id` column directly on the table, so filtering is straightforward.

- [ ] **Step 1: Update `apps/admin/app/reservations/page.tsx`**

Replace the entire file:

```tsx
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ReservationsClient from "./ReservationsClient";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: { branch?: string };
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();

  const isBranchManager = profile.role === "branch_manager";
  const activeBranchId: string | null = isBranchManager
    ? (profile.branch_id ?? null)
    : (searchParams.branch ?? null) || null;

  const [{ data: reservations }, { data: branches }] = await Promise.all([
    activeBranchId
      ? supabase
          .from("reservations")
          .select("*, products(name, price), branches(name, whatsapp_number)")
          .eq("branch_id", activeBranchId)
          .order("created_at", { ascending: false })
      : supabase
          .from("reservations")
          .select("*, products(name, price), branches(name, whatsapp_number)")
          .order("created_at", { ascending: false }),
    supabase.from("branches").select("id, name, whatsapp_number").order("name"),
  ]);

  return (
    <ReservationsClient
      profile={profile}
      branches={(branches ?? []) as any[]}
      activeBranchId={activeBranchId}
      initialReservations={(reservations ?? []) as any[]}
    />
  );
}
```

- [ ] **Step 2: Update `ReservationsClient.tsx` props and AdminShell call**

Add `activeBranchId` to the Props interface:

```tsx
interface Props {
  profile: Profile;
  initialReservations: ReservationRow[];
  branches: { id: string; name: string; whatsapp_number: string }[];
  activeBranchId: string | null;
}

export default function ReservationsClient({ profile, initialReservations, branches, activeBranchId }: Props) {
```

Update `AdminShell` usage:

```tsx
  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
```

- [ ] **Step 3: Verify TypeScript compiles**

```powershell
cd apps/admin; npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/app/reservations/page.tsx apps/admin/app/reservations/ReservationsClient.tsx
git commit -m "feat(admin): apply branch filter to reservations page"
```

---

## Task 5: Apply branch filter to Banners page

**Files:**
- Modify: `apps/admin/app/banners/page.tsx`
- Modify: `apps/admin/app/banners/BannersClient.tsx`

Banners have a `branch_id` column directly.

- [ ] **Step 1: Update `apps/admin/app/banners/page.tsx`**

Replace the entire file:

```tsx
import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import BannersClient from "./BannersClient";

export default async function BannersPage({
  searchParams,
}: {
  searchParams: { branch?: string };
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();

  const isBranchManager = profile.role === "branch_manager";
  const activeBranchId: string | null = isBranchManager
    ? (profile.branch_id ?? null)
    : (searchParams.branch ?? null) || null;

  const [{ data: banners }, { data: branches }, { data: categories }, { data: products }] = await Promise.all([
    activeBranchId
      ? supabase.from("banners").select("*").eq("branch_id", activeBranchId).order("sort_order")
      : supabase.from("banners").select("*").order("sort_order"),
    supabase.from("branches").select("*").eq("is_active", true),
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("products").select("id, name"),
  ]);

  return (
    <BannersClient
      profile={profile}
      branches={branches ?? []}
      activeBranchId={activeBranchId}
      initialBanners={banners ?? []}
      categories={categories ?? []}
      products={products ?? []}
    />
  );
}
```

- [ ] **Step 2: Update `BannersClient.tsx` props and AdminShell call**

Add `activeBranchId` to Props:

```tsx
interface Props {
  profile: Profile;
  initialBanners: Banner[];
  branches: Branch[];
  categories: Pick<Category, "id" | "name">[];
  products: Pick<Product, "id" | "name">[];
  activeBranchId: string | null;
}

export default function BannersClient({ profile, initialBanners, branches, categories, products, activeBranchId }: Props) {
```

Update `AdminShell` usage:

```tsx
  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
```

- [ ] **Step 3: Verify TypeScript compiles**

```powershell
cd apps/admin; npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/app/banners/page.tsx apps/admin/app/banners/BannersClient.tsx
git commit -m "feat(admin): apply branch filter to banners page"
```

---

## Task 6: Apply branch filter to Deals page

**Files:**
- Modify: `apps/admin/app/deals/page.tsx`
- Modify: `apps/admin/app/deals/DealsClient.tsx`

Deals (`deal_pamphlets`) have a `branch_id` column directly.

- [ ] **Step 1: Update `apps/admin/app/deals/page.tsx`**

Replace the entire file:

```tsx
import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DealsClient from "./DealsClient";

export default async function DealsPage({
  searchParams,
}: {
  searchParams: { branch?: string };
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();

  const isBranchManager = profile.role === "branch_manager";
  const activeBranchId: string | null = isBranchManager
    ? (profile.branch_id ?? null)
    : (searchParams.branch ?? null) || null;

  const [{ data: deals }, { data: branches }] = await Promise.all([
    activeBranchId
      ? supabase.from("deal_pamphlets").select("*").eq("branch_id", activeBranchId).order("sort_order")
      : supabase.from("deal_pamphlets").select("*").order("sort_order"),
    supabase.from("branches").select("*").eq("is_active", true),
  ]);

  return (
    <DealsClient
      profile={profile}
      branches={branches ?? []}
      activeBranchId={activeBranchId}
      initialDeals={deals ?? []}
    />
  );
}
```

- [ ] **Step 2: Update `DealsClient.tsx` props and AdminShell call**

Add `activeBranchId` to Props:

```tsx
interface Props {
  profile: Profile;
  initialDeals: DealPamphlet[];
  branches: Branch[];
  activeBranchId: string | null;
}

export default function DealsClient({ profile, initialDeals, branches, activeBranchId }: Props) {
```

Update `AdminShell` usage:

```tsx
  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
```

- [ ] **Step 3: Verify TypeScript compiles**

```powershell
cd apps/admin; npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/app/deals/page.tsx apps/admin/app/deals/DealsClient.tsx
git commit -m "feat(admin): apply branch filter to deals page"
```

---

## Task 7: Apply branch filter to Categories page

**Files:**
- Modify: `apps/admin/app/categories/page.tsx`
- Modify: `apps/admin/app/categories/CategoriesClient.tsx`

Categories are global (no `branch_id`), so there is no data filtering. However, we still need to pass `branches` and `activeBranchId` to `AdminShell` so the selector renders consistently on every page.

- [ ] **Step 1: Update `apps/admin/app/categories/page.tsx`**

Replace the entire file:

```tsx
import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { branch?: string };
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createSupabaseServerClient();

  const isBranchManager = profile.role === "branch_manager";
  const activeBranchId: string | null = isBranchManager
    ? (profile.branch_id ?? null)
    : (searchParams.branch ?? null) || null;

  const [{ data: categories }, { data: branches }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("branches").select("id, name").eq("is_active", true),
  ]);

  return (
    <CategoriesClient
      profile={profile}
      branches={branches ?? []}
      activeBranchId={activeBranchId}
      initialCategories={categories ?? []}
    />
  );
}
```

- [ ] **Step 2: Update `CategoriesClient.tsx` props and AdminShell call**

```tsx
interface Props {
  profile: Profile;
  initialCategories: Category[];
  branches: { id: string; name: string }[];
  activeBranchId: string | null;
}

export default function CategoriesClient({ profile, initialCategories, branches, activeBranchId }: Props) {
```

Update `AdminShell` usage:

```tsx
  return (
    <AdminShell role={profile.role} branches={branches} activeBranchId={activeBranchId}>
```

- [ ] **Step 3: Verify TypeScript compiles**

```powershell
cd apps/admin; npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/app/categories/page.tsx apps/admin/app/categories/CategoriesClient.tsx
git commit -m "feat(admin): pass branch context to categories page AdminShell"
```

---

## Task 8: Preserve branch param when navigating between pages

**Files:**
- Modify: `apps/admin/components/AdminShell.tsx`

When a user clicks a nav link (e.g., from Products to Banners), the `?branch=` param must carry over. Without this, switching to a new page resets the selector to "All Branches".

- [ ] **Step 1: Update nav `Link` components to append branch param**

In `AdminShell.tsx`, import `useSearchParams` from `next/navigation` and add a helper that appends the current branch param to nav links.

Add to imports:

```tsx
import { usePathname, useRouter, useSearchParams } from "next/navigation";
```

Add inside the `AdminShell` component body (after existing state declarations):

```tsx
const searchParams = useSearchParams();
const branchParam = searchParams.get("branch");

function navHref(href: string) {
  if (!branchParam) return href;
  return `${href}?branch=${branchParam}`;
}
```

- [ ] **Step 2: Replace all nav `Link href={item.href}` with `href={navHref(item.href)}`**

There are two nav lists (mobile drawer + desktop sidebar). In both, change:

```tsx
href={item.href}
```

to:

```tsx
href={navHref(item.href)}
```

There are 4 occurrences total (2 per nav list — one in mobile, one in desktop).

- [ ] **Step 3: Wrap AdminShell in Suspense in layout to support useSearchParams**

`useSearchParams` requires a Suspense boundary. In `apps/admin/app/layout.tsx`, wrap children in `<Suspense>`:

```tsx
import { Suspense } from "react";

// Inside the body/return:
<Suspense fallback={null}>
  {children}
</Suspense>
```

Read `apps/admin/app/layout.tsx` first, then add the Suspense wrapper around `{children}`.

- [ ] **Step 4: Verify TypeScript compiles**

```powershell
cd apps/admin; npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/components/AdminShell.tsx apps/admin/app/layout.tsx
git commit -m "feat(admin): preserve branch param across nav links"
```

---

## Task 9: Lock branch_manager out of cross-branch data access

**Files:**
- Modify: `apps/admin/app/page.tsx` (already done in Task 2)
- Modify: `apps/admin/app/products/page.tsx` (already done in Task 3)
- Modify: `apps/admin/app/reservations/page.tsx` (already done in Task 4)
- Modify: `apps/admin/app/banners/page.tsx` (already done in Task 5)
- Modify: `apps/admin/app/deals/page.tsx` (already done in Task 6)

The server-side lock is already in place from Tasks 2–6 via the `isBranchManager` logic. This task is a verification and hardening pass.

- [ ] **Step 1: Verify branch_manager lock in each server page**

Each page already has this pattern:

```tsx
const isBranchManager = profile.role === "branch_manager";
const activeBranchId: string | null = isBranchManager
  ? (profile.branch_id ?? null)
  : (searchParams.branch ?? null) || null;
```

This means a branch_manager will always have `activeBranchId = profile.branch_id`, regardless of any `?branch=` param in the URL. Even if a branch_manager manually crafts a URL like `?branch=other-branch-id`, it is ignored. Verify this is present in all 5 pages (dashboard, products, reservations, banners, deals).

- [ ] **Step 2: Verify BranchSelector is not rendered for branch_manager**

In `AdminShell.tsx`, the selector is gated:

```tsx
{(role === "super_admin" || role === "admin") && branches.length > 0 && (
  <BranchSelector ... />
)}
```

A branch_manager will never see the selector. Confirm this is the case.

- [ ] **Step 3: Final TypeScript check across entire admin app**

```powershell
cd apps/admin; npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(admin): branch context filter complete — branch_manager locked, admins can filter"
```

---

## Spec Coverage Check

| Requirement | Task |
|---|---|
| Admins/super_admins can select All Branches or a specific branch | Task 1 (selector UI) |
| Branch selector visible in header | Task 1 |
| Dashboard stats filter by selected branch | Task 2 |
| Products filtered by selected branch | Task 3 |
| Reservations filtered by selected branch | Task 4 |
| Banners filtered by selected branch | Task 5 |
| Deals filtered by selected branch | Task 6 |
| Categories page shows selector (global data, no filter) | Task 7 |
| Branch param persists when navigating | Task 8 |
| Branch managers locked to their branch, cannot see or access other branches | Tasks 2–6 + Task 9 |
| Branch managers cannot use URL param to bypass branch lock | Tasks 2–6 (server-side isBranchManager check) |
