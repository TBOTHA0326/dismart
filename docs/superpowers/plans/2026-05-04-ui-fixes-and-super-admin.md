# UI Fixes & Super-Admin Role Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix carousel arrow button overflow, add WhatsApp CTA + Branch Info sections to the home page bottom, and introduce a `super_admin` role that restricts branch creation to Chenexa accounts.

**Architecture:** Three independent change sets — (1) layout fix to ProductRow and CategoryStrip carousel buttons so they sit outside the scroll rail as flex siblings rather than absolute overlays, (2) two new home page sections (WhatsAppCTABanner + BranchInfoSection) inserted before the footer, (3) a new `super_admin` role added to the DB schema, shared types, admin mock data, and CMS UI pages.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind CSS, Supabase (PostgreSQL migrations), pnpm monorepo

---

## File Map

| File | Change |
|------|--------|
| `apps/web/components/home/ProductRow.tsx` | Refactor arrow buttons from absolute-positioned overlays to flex siblings outside scroll rail |
| `apps/web/components/home/CategoryStrip.tsx` | Same arrow button refactor |
| `apps/web/components/home/WhatsAppCTABanner.tsx` | **Create** — full-width navy WhatsApp CTA section |
| `apps/web/components/home/BranchInfoSection.tsx` | **Create** — branch address/phone/switch section |
| `apps/web/app/page.tsx` | Import and render WhatsAppCTABanner + BranchInfoSection before Footer |
| `packages/shared/src/types/index.ts` | Add `super_admin` to `Profile.role` union |
| `apps/admin/lib/data.ts` | Add `super_admin` profile seed entry |
| `apps/admin/app/branches/page.tsx` | Hide "New Branch" button unless `super_admin`; show locked message for admins |
| `apps/admin/app/users/page.tsx` | Scope "Invite User" by role; branch managers only see their branch users |
| `apps/admin/components/AdminShell.tsx` | Hide "Branches" nav item for `branch_manager` role |
| `supabase/migrations/20260504210000_super_admin_role.sql` | **Create** — alter role check, add branch count trigger, update RLS |

---

## Task 1: Fix ProductRow Arrow Buttons

**Files:**
- Modify: `apps/web/components/home/ProductRow.tsx`

- [ ] **Step 1: Replace absolute-positioned arrows with flex siblings**

The original scroll div had `pr-4 md:pr-8` padding to avoid content going under the overlay buttons. Those classes are intentionally removed in the new layout — the flex-sibling buttons sit outside the scroll rail entirely so no padding compensation is needed.

Replace the entire component with:

```tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, Branch } from "@dismart/shared";
import ProductCard from "@/components/product/ProductCard";

interface ProductRowProps {
  title: string;
  products: Product[];
  branch: Branch;
  viewAllHref?: string;
}

export default function ProductRow({ title, products, branch, viewAllHref }: ProductRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scrollByCard(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -520 : 520,
      behavior: "smooth",
    });
  }

  return (
    <section className="max-w-7xl mx-auto px-4 my-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black text-brand-navy uppercase tracking-wide">
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-brand-red hover:underline"
          >
            View All
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => scrollByCard("left")}
          className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-navy shadow-md transition hover:border-brand-yellow md:flex"
          aria-label={`Scroll ${title} left`}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div
          ref={scrollerRef}
          onWheel={(event) => {
            if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
              event.currentTarget.scrollLeft += event.deltaY;
            }
          }}
          className="flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scroll-smooth"
        >
          {products.map((product) => (
            <div key={product.id} className="w-44 flex-shrink-0 snap-start sm:w-52">
              <ProductCard product={product} branch={branch} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollByCard("right")}
          className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-navy shadow-md transition hover:border-brand-yellow md:flex"
          aria-label={`Scroll ${title} right`}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the dev server compiles without errors**

Run: `cd apps/web && pnpm dev`
Expected: No TypeScript or compilation errors in the terminal.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/home/ProductRow.tsx
git commit -m "fix: move ProductRow arrows outside scroll rail as flex siblings"
```

---

## Task 2: Fix CategoryStrip Arrow Buttons

**Files:**
- Modify: `apps/web/components/home/CategoryStrip.tsx`

- [ ] **Step 1: Replace absolute-positioned arrows with flex siblings**

Replace the entire component with:

```tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@dismart/shared";
import CategoryIcon from "@/components/ui/CategoryIcon";

interface CategoryStripProps {
  categories: Category[];
}

export default function CategoryStrip({ categories }: CategoryStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollRail(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth",
    });
  }

  return (
    <section className="border-b border-gray-100 bg-white py-4">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollRail("left")}
            className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-navy shadow-md transition hover:border-brand-yellow md:flex"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div
            ref={scrollerRef}
            onWheel={(event) => {
              if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                event.currentTarget.scrollLeft += event.deltaY;
              }
            }}
            className="flex-1 overflow-x-auto pb-2 scroll-smooth"
          >
            <div className="mx-auto flex w-max min-w-full justify-start gap-4 md:justify-center md:gap-5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className="group flex w-24 flex-shrink-0 flex-col items-center gap-2"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-yellow/40 bg-brand-yellow/15 text-brand-navy transition-all group-hover:border-brand-yellow group-hover:bg-brand-yellow/30 group-hover:text-brand-red">
                    <CategoryIcon name={cat.icon_name} className="h-7 w-7" />
                  </div>
                  <span className="w-full text-center text-xs font-semibold leading-tight text-gray-700 transition-colors line-clamp-2 group-hover:text-brand-navy">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollRail("right")}
            className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-navy shadow-md transition hover:border-brand-yellow md:flex"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the dev server compiles without errors**

Run: `cd apps/web && pnpm dev`
Expected: No TypeScript or compilation errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/home/CategoryStrip.tsx
git commit -m "fix: move CategoryStrip arrows outside scroll rail as flex siblings"
```

---

## Task 3: Create WhatsAppCTABanner Component

**Files:**
- Create: `apps/web/components/home/WhatsAppCTABanner.tsx`

- [ ] **Step 1: Create the component**

`WhatsAppCTABanner` has no client-only APIs (no hooks, no browser globals), so it is valid as a Server Component — no `"use client"` directive needed. It receives `branch` as a plain serialisable prop from the Client Component parent in page.tsx.

```tsx
import type { Branch } from "@dismart/shared";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppCTABannerProps {
  branch: Branch;
}

export default function WhatsAppCTABanner({ branch }: WhatsAppCTABannerProps) {
  return (
    <section className="bg-brand-navy py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              Got a question? Chat to us on WhatsApp
            </h2>
            <p className="mt-2 text-base text-white/70">
              {branch.name} branch &mdash; {branch.whatsapp_number}
            </p>
          </div>
          <WhatsAppButton
            href={buildGeneralWhatsAppLink(branch)}
            label="Chat Now"
            size="lg"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/web && pnpm dev`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/home/WhatsAppCTABanner.tsx
git commit -m "feat: add WhatsAppCTABanner component"
```

---

## Task 4: Create BranchInfoSection Component

**Files:**
- Create: `apps/web/components/home/BranchInfoSection.tsx`

- [ ] **Step 1: Create the component**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/web && pnpm dev`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/home/BranchInfoSection.tsx
git commit -m "feat: add BranchInfoSection component"
```

---

## Task 5: Wire New Sections into Home Page

**Files:**
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Import the two new components**

At the top of `apps/web/app/page.tsx`, add two imports after the existing home component imports:

```tsx
import WhatsAppCTABanner from "@/components/home/WhatsAppCTABanner";
import BranchInfoSection from "@/components/home/BranchInfoSection";
```

- [ ] **Step 2: Insert sections before the Footer**

In the JSX, the current structure ends with:
```tsx
      </main>

      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
```

Replace those closing lines with:
```tsx
      </main>

      {branch && <WhatsAppCTABanner branch={branch} />}
      {branch && <BranchInfoSection branch={branch} />}

      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
```

- [ ] **Step 3: Also remove the existing inline yellow "Can't find what you're looking for?" block from page.tsx**

This block is located inside `<main>`, inside the `<>` else-branch of the `branch && searchTerm` ternary (not after `</main>`). Remove only this block and leave all surrounding JSX structure intact:

Find and remove this block (it's now superseded by the WhatsAppCTABanner):
```tsx
            {branch && (
              <div className="mx-4 my-8 flex max-w-7xl flex-col items-center justify-between gap-4 rounded-xl bg-brand-yellow p-6 md:mx-auto md:flex-row md:p-10">
                <div>
                  <h2 className="text-xl font-black text-brand-navy md:text-2xl">
                    Can&apos;t find what you&apos;re looking for?
                  </h2>
                  <p className="mt-1 text-sm text-brand-navy/70">
                    Chat directly with our {branch.name} team and we&apos;ll help you find it.
                  </p>
                </div>
                <WhatsAppButton
                  href={buildGeneralWhatsAppLink(branch)}
                  label={`Chat with ${branch.name}`}
                  size="lg"
                />
              </div>
            )}
```

Also remove these now-unused imports — they are only used inside the yellow CTA block being removed and nowhere else in `page.tsx`:
- Remove `import WhatsAppButton from "@/components/ui/WhatsAppButton";`
- Remove `import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";`

- [ ] **Step 4: Verify dev server compiles and the page renders the two new sections at the bottom**

Run: `cd apps/web && pnpm dev`
Open http://localhost:3000 and scroll to the bottom — confirm navy WhatsApp CTA banner and gray branch info section appear before the footer.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat: add WhatsApp CTA and branch info sections to home page bottom"
```

---

## Task 6: Add super_admin to Shared Types

**Files:**
- Modify: `packages/shared/src/types/index.ts`

- [ ] **Step 1: Update the Profile role union**

Find:
```ts
  role: "admin" | "branch_manager";
```

Replace with:
```ts
  role: "super_admin" | "admin" | "branch_manager";
```

- [ ] **Step 2: Verify no TypeScript errors across the monorepo**

Run: `pnpm --filter web dev`
Expected: No errors. (The role union is widened, not narrowed, so no breaking changes.)

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/types/index.ts
git commit -m "feat: add super_admin to Profile role type"
```

---

## Task 7: Add super_admin Supabase Migration

**Files:**
- Create: `supabase/migrations/20260504210000_super_admin_role.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- Expand role check to include super_admin
alter table public.profiles
  drop constraint profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'branch_manager'));

-- Helper: check if current user is super_admin
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'super_admin', false)
$$;

-- Update is_admin to include super_admin so existing admin checks still pass
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    public.current_profile_role() in ('admin', 'super_admin'),
    false
  )
$$;

-- Branch count guard: limit to 3 branches total (active or inactive).
-- Counting all rows (not just is_active = true) enforces the subscription
-- limit regardless of whether a branch is currently toggled on or off.
create or replace function public.check_branch_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.branches) >= 3 then
    raise exception 'Branch limit reached. Maximum 3 branches allowed.';
  end if;
  return new;
end;
$$;

create trigger enforce_branch_limit
  before insert on public.branches
  for each row
  execute function public.check_branch_limit();

-- Only super_admin can manage branches (replaces "Admins manage branches")
drop policy if exists "Admins manage branches" on public.branches;

create policy "Super admins manage branches"
on public.branches for all
using (public.is_super_admin())
with check (public.is_super_admin());

-- Only super_admin can manage profiles with super_admin role.
-- Note on RLS semantics: for UPDATE, `using` checks the existing row and
-- `with check` checks the new row. This means:
--   - An admin cannot read/update an existing super_admin profile (using blocks it).
--   - An admin cannot elevate a profile to super_admin (with check blocks it).
-- Side effect: because is_admin() now returns true for super_admin (updated above),
-- the "CMS can manage product branch links" policy (using can_manage_branch) will
-- also allow super_admin to manage product_branches rows — this is the desired behaviour.
drop policy if exists "Admins manage profiles" on public.profiles;

create policy "Admins manage profiles"
on public.profiles for all
using (
  public.is_super_admin()
  or (
    public.is_admin()
    and role != 'super_admin'
  )
)
with check (
  public.is_super_admin()
  or (
    public.is_admin()
    and role != 'super_admin'
  )
);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260504210000_super_admin_role.sql
git commit -m "feat: add super_admin role, branch limit trigger, and updated RLS policies"
```

---

## Task 8: Add super_admin Seed Profile in Admin Mock Data

**Files:**
- Modify: `apps/admin/lib/data.ts`

- [ ] **Step 1: Add a super_admin profile entry**

**IMPORTANT:** Tasks 9, 10, and 11 all read `profiles[0]` to simulate the active session. The `super_admin` entry MUST remain at index 0 — do not reorder this array.

In `apps/admin/lib/data.ts`, find the `profiles` array and replace it entirely with:

```ts
export const profiles: Profile[] = [
  {
    id: "user-super-admin",
    full_name: "Chenexa Super Admin",
    role: "super_admin",
    branch_id: null,
  },
  {
    id: "user-admin",
    full_name: "Dismart Admin",
    role: "admin",
    branch_id: null,
  },
  {
    id: "user-meyerton",
    full_name: "Meyerton Manager",
    role: "branch_manager",
    branch_id: "branch-meyerton",
  },
];
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/admin && pnpm dev`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/lib/data.ts
git commit -m "feat: add super_admin seed profile to admin mock data"
```

---

## Task 9: Gate Branches Page by Role

**Files:**
- Modify: `apps/admin/app/branches/page.tsx`

The admin CMS currently has no auth context wired — mock data is used. For now, simulate the active role by reading from mock data (the first super_admin profile). When Supabase auth is connected later, this pattern will be replaced with a real session check.

- [ ] **Step 1: Replace the branches page**

```tsx
import { Lock, Plus } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { branches, profiles } from "@/lib/data";

// Temporary: simulate active user role from mock data
// Replace with real session check when Supabase Auth is connected
const activeProfile = profiles[0]; // super_admin in seed data
const isSuperAdmin = activeProfile.role === "super_admin";

export default function BranchesPage() {
  return (
    <AdminShell>
      <PageHeader
        title="Branches"
        description="Branch setup for contact details, WhatsApp numbers and active status. Managed by Chenexa."
        action={
          isSuperAdmin ? (
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Branch
            </button>
          ) : (
            <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 text-sm font-bold text-gray-400 cursor-not-allowed">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Managed by Chenexa
            </div>
          )
        }
      />
      <Table
        headers={["Branch", "Address", "Phone", "WhatsApp", "Status"]}
        rows={branches.map((branch) => [
          <span className="font-bold text-brand-navy" key="branch">{branch.name}</span>,
          branch.address,
          branch.phone,
          branch.whatsapp_number,
          branch.is_active ? "Active" : "Inactive",
        ])}
      />
    </AdminShell>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/admin && pnpm dev`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/app/branches/page.tsx
git commit -m "feat: gate branch creation to super_admin role in CMS"
```

---

## Task 10: Gate Users Page by Role + Scope branch_manager View

**Files:**
- Modify: `apps/admin/app/users/page.tsx`

- [ ] **Step 1: Replace the users page**

```tsx
import { Plus } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { branches, profiles } from "@/lib/data";

// Temporary: simulate active user role from mock data
// Replace with real session check when Supabase Auth is connected
const activeProfile = profiles[0]; // super_admin in seed data
const isSuperAdmin = activeProfile.role === "super_admin";
const isAdmin = activeProfile.role === "admin" || isSuperAdmin;

// branch_manager can only see users in their own branch
const visibleProfiles = isAdmin
  ? profiles
  : profiles.filter((p) => p.branch_id === activeProfile.branch_id);

// branch_manager cannot invite super_admin or admin users
const canInvite = isAdmin;

export default function UsersPage() {
  return (
    <AdminShell>
      <PageHeader
        title="Users"
        description="Assign CMS users to branches and control admin or branch manager access."
        action={
          canInvite ? (
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-bold text-white">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Invite User
            </button>
          ) : undefined
        }
      />
      <Table
        headers={["Name", "Role", "Branch"]}
        rows={visibleProfiles.map((profile) => [
          <span className="font-bold text-brand-navy" key="name">{profile.full_name}</span>,
          profile.role.replace(/_/g, " "),
          profile.branch_id
            ? branches.find((b) => b.id === profile.branch_id)?.name ?? "Unknown"
            : "All branches",
        ])}
      />
    </AdminShell>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/admin && pnpm dev`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/app/users/page.tsx
git commit -m "feat: scope user management by role in CMS"
```

---

## Task 11: Hide Branches Nav Item for branch_manager

**Files:**
- Modify: `apps/admin/components/AdminShell.tsx`

- [ ] **Step 1: Filter nav items by role**

Replace the static `navItems` array and the `AdminShell` component with a role-aware version:

```tsx
import Link from "next/link";
import {
  BadgePercent,
  Boxes,
  Building2,
  FileText,
  LayoutDashboard,
  Menu,
  Tags,
  Users,
} from "lucide-react";
import { profiles } from "@/lib/data";

// Temporary: simulate active user role from mock data
// Replace with real session check when Supabase Auth is connected
const activeProfile = profiles[0];
const isBranchManager = activeProfile.role === "branch_manager";

// `hiddenFromBranchManager` flags nav items that branch managers should not see.
// Both admin and super_admin roles can see all items.
// When real auth replaces mock data, replace the module-level activeProfile
// constant with a session hook and move navItems filtering inside the component.
const allNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/banners", label: "Banners", icon: BadgePercent },
  { href: "/deals", label: "Deals", icon: FileText },
  { href: "/branches", label: "Branches", icon: Building2, hiddenFromBranchManager: true },
  { href: "/users", label: "Users", icon: Users },
];

const navItems = isBranchManager
  ? allNavItems.filter((item) => !item.hiddenFromBranchManager)
  : allNavItems;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-2xl font-black tracking-tight">
            <span className="text-brand-navy">DIS</span>
            <span className="text-brand-red">MART</span>
            <span className="ml-2 text-sm font-bold text-gray-400">CMS</span>
          </Link>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-brand-navy md:hidden">
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Open navigation</span>
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-gray-600 transition hover:bg-white hover:text-brand-navy hover:shadow-sm"
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/admin && pnpm dev`
Expected: No errors. With `profiles[0]` being `super_admin`, all nav items show including Branches.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/components/AdminShell.tsx
git commit -m "feat: hide Branches nav item for branch_manager role"
```

---

## Done

All 11 tasks complete. The implementation covers:
- ✅ Arrow buttons no longer overlap card content on product rows and category strip
- ✅ WhatsApp CTA banner + Branch Info section fill the bottom of the home page
- ✅ `super_admin` role added to types, DB schema, and mock data
- ✅ Branch creation gated to `super_admin` in CMS (with DB trigger enforcing 3-branch limit)
- ✅ User management scoped by role; `branch_manager` sees only their branch users and cannot invite new users
- ✅ Branches nav item hidden from `branch_manager` sidebar
