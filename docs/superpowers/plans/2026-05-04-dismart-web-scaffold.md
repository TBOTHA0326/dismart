# Dismart Web App Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full Dismart monorepo and build the `/apps/web` public customer-facing Next.js app with mock data, matching the Checkers Sixty60 layout pattern with Dismart branding.

**Architecture:** pnpm workspaces monorepo with `/apps/web` (Next.js 14 App Router, TypeScript, Tailwind) and `/packages/shared` (shared TypeScript types). All data is mocked in `lib/mock-data.ts` — no Supabase calls yet. Branch detection uses the browser Geolocation API with localStorage persistence and a manual dropdown fallback.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS 3, pnpm workspaces, next/font (Geist), next/image

---

## Task 1: Monorepo Root Scaffold

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`

- [ ] **Step 1: Create `.gitignore`**

Create `c:\Personal Projects\Tiaan\dismart\.gitignore`:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# OS
.DS_Store
Thumbs.db

# Editors
.vscode/
.idea/
*.swp
*.swo

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Turbo
.turbo
```

- [ ] **Step 2: Create root `package.json`**

Create `c:\Personal Projects\Tiaan\dismart\package.json`:

```json
{
  "name": "dismart",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build",
    "lint": "pnpm --filter web lint"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

- [ ] **Step 3: Create `pnpm-workspace.yaml`**

Create `c:\Personal Projects\Tiaan\dismart\pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore package.json pnpm-workspace.yaml
git commit -m "chore: init monorepo root with pnpm workspaces"
```

---

## Task 2: Shared Types Package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/src/types/index.ts`

- [ ] **Step 1: Create `packages/shared/package.json`**

```json
{
  "name": "@dismart/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/types/index.ts",
  "types": "./src/types/index.ts",
  "exports": {
    ".": "./src/types/index.ts"
  }
}
```

- [ ] **Step 2: Create `packages/shared/src/types/index.ts`**

```typescript
export interface Branch {
  id: string;
  name: string;
  location: string;
  address: string;
  whatsapp_number: string;
  phone: string;
  is_active: boolean;
  lat: number;
  lng: number;
}

export interface Category {
  id: string;
  name: string;
  icon_emoji: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  expiry_date: string | null;
  is_special: boolean;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  created_at: string;
  branch_ids: string[];
}

export interface Banner {
  id: string;
  branch_id: string;
  image_url: string;
  headline: string;
  subtext: string | null;
  link_type: "category" | "product" | "none";
  link_id: string | null;
  is_active: boolean;
  sort_order: number;
  bg_color: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/
git commit -m "feat: add shared types package (Branch, Category, Product, Banner)"
```

---

## Task 3: Next.js Web App Scaffold

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/tailwind.config.ts`

- [ ] **Step 1: Create `apps/web/package.json`**

```json
{
  "name": "web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@dismart/shared": "workspace:*",
    "next": "14.2.29",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `apps/web/next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create `apps/web/tsconfig.json`**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@dismart/shared": ["../../packages/shared/src/types/index.ts"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `apps/web/postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Create `apps/web/tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFD100",
          navy: "#1B2B5B",
          red: "#E8212A",
          "yellow-dark": "#E6BC00",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Install dependencies**

From the monorepo root (`c:\Personal Projects\Tiaan\dismart`):

```bash
pnpm install
```

Expected: pnpm creates a lockfile and installs all workspace dependencies.

- [ ] **Step 7: Commit**

```bash
git add apps/web/ pnpm-lock.yaml
git commit -m "feat: scaffold apps/web Next.js app with Tailwind and TypeScript"
```

---

## Task 4: Mock Data

**Files:**
- Create: `apps/web/lib/mock-data.ts`
- Create: `apps/web/lib/whatsapp.ts`
- Create: `apps/web/lib/branch.ts`

- [ ] **Step 1: Create `apps/web/lib/mock-data.ts`**

```typescript
import type { Branch, Category, Product, Banner } from "@dismart/shared";

export const BRANCHES: Branch[] = [
  {
    id: "branch-meyerton",
    name: "Meyerton",
    location: "Meyerton",
    address: "12 Kerk Street, Meyerton, 1961",
    whatsapp_number: "27821234567",
    phone: "0161234567",
    is_active: true,
    lat: -26.5597,
    lng: 27.9994,
  },
  {
    id: "branch-riversdale",
    name: "Riversdale",
    location: "Riversdale",
    address: "5 Main Road, Riversdale, 6670",
    whatsapp_number: "27827654321",
    phone: "0287654321",
    is_active: true,
    lat: -34.0944,
    lng: 21.2586,
  },
  {
    id: "branch-vanderbijlpark",
    name: "Vanderbijlpark",
    location: "Vanderbijlpark",
    address: "88 Frikkie Meyer Blvd, Vanderbijlpark, 1911",
    whatsapp_number: "27829876543",
    phone: "0169876543",
    is_active: true,
    lat: -26.7005,
    lng: 27.8378,
  },
];

export const CATEGORIES: Category[] = [
  { id: "cat-groceries", name: "Groceries", icon_emoji: "🛒", sort_order: 1 },
  { id: "cat-household", name: "Household", icon_emoji: "🏠", sort_order: 2 },
  { id: "cat-cleaning", name: "Cleaning", icon_emoji: "🧹", sort_order: 3 },
  { id: "cat-personal-care", name: "Personal Care", icon_emoji: "🧴", sort_order: 4 },
  { id: "cat-toiletries", name: "Toiletries", icon_emoji: "🪥", sort_order: 5 },
  { id: "cat-baby", name: "Baby & Toddler", icon_emoji: "👶", sort_order: 6 },
  { id: "cat-confectionery", name: "Confectionery", icon_emoji: "🍬", sort_order: 7 },
  { id: "cat-beverages", name: "Beverages", icon_emoji: "🥤", sort_order: 8 },
  { id: "cat-electronics", name: "Electronics", icon_emoji: "📱", sort_order: 9 },
  { id: "cat-appliances", name: "Appliances", icon_emoji: "🔌", sort_order: 10 },
  { id: "cat-clothing", name: "Clothing", icon_emoji: "👕", sort_order: 11 },
  { id: "cat-toys", name: "Toys", icon_emoji: "🧸", sort_order: 12 },
  { id: "cat-hardware", name: "Hardware", icon_emoji: "🔧", sort_order: 13 },
  { id: "cat-stationery", name: "Stationery", icon_emoji: "✏️", sort_order: 14 },
];

export const PRODUCTS: Product[] = [
  // Groceries
  {
    id: "prod-1",
    name: "Jungle Oats 1kg",
    description: "Classic rolled oats, a South African breakfast staple.",
    price: 39.99,
    category_id: "cat-groceries",
    image_url: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=400&fit=crop",
    expiry_date: "2025-12-01",
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  {
    id: "prod-2",
    name: "Lucky Star Pilchards 400g",
    description: "Pilchards in tomato sauce, tinned.",
    price: 24.99,
    category_id: "cat-groceries",
    image_url: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop",
    expiry_date: "2026-06-01",
    is_special: false,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  {
    id: "prod-3",
    name: "All Gold Tomato Sauce 700ml",
    description: "South Africa's favourite tomato sauce.",
    price: 34.99,
    category_id: "cat-groceries",
    image_url: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=400&fit=crop",
    expiry_date: "2026-09-01",
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-riversdale"],
  },
  // Household
  {
    id: "prod-4",
    name: "Glad Large Bin Bags 20 Pack",
    description: "Heavy duty black bin bags for large waste bins.",
    price: 49.99,
    category_id: "cat-household",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  {
    id: "prod-5",
    name: "Aerolite Food Storage Set 5pc",
    description: "Stackable airtight food storage containers.",
    price: 89.99,
    category_id: "cat-household",
    image_url: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: false,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark"],
  },
  // Cleaning
  {
    id: "prod-6",
    name: "Handy Andy Multi-Purpose 750ml",
    description: "Cream cleaner for all household surfaces.",
    price: 29.99,
    category_id: "cat-cleaning",
    image_url: "https://images.unsplash.com/photo-1585586723682-168e3b2a9370?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  {
    id: "prod-7",
    name: "Sunlight Dishwashing Liquid 750ml",
    description: "Lemon-scented dishwashing liquid, tough on grease.",
    price: 22.99,
    category_id: "cat-cleaning",
    image_url: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: false,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-riversdale"],
  },
  // Personal Care
  {
    id: "prod-8",
    name: "Dove Body Wash 400ml",
    description: "Moisturising body wash with ¼ moisturising cream.",
    price: 59.99,
    category_id: "cat-personal-care",
    image_url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  {
    id: "prod-9",
    name: "Nivea Men Roll-On 50ml",
    description: "48h protection anti-perspirant deodorant.",
    price: 44.99,
    category_id: "cat-personal-care",
    image_url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: false,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark"],
  },
  // Toiletries
  {
    id: "prod-10",
    name: "Colgate Triple Action 100ml",
    description: "Triple action cavity protection toothpaste.",
    price: 27.99,
    category_id: "cat-toiletries",
    image_url: "https://images.unsplash.com/photo-1559589689-577eca9d670f?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  {
    id: "prod-11",
    name: "Listerine Coolmint 500ml",
    description: "Antibacterial mouthwash for lasting fresh breath.",
    price: 54.99,
    category_id: "cat-toiletries",
    image_url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: false,
    stock_status: "low_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton"],
  },
  // Baby & Toddler
  {
    id: "prod-12",
    name: "Pampers Active Baby Size 3 52pk",
    description: "Up to 12 hours of dryness for active babies.",
    price: 149.99,
    category_id: "cat-baby",
    image_url: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  // Confectionery
  {
    id: "prod-13",
    name: "Beacon Assorted Chocolates 200g",
    description: "A selection of South African favourite chocolates.",
    price: 34.99,
    category_id: "cat-confectionery",
    image_url: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop",
    expiry_date: "2026-03-01",
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  {
    id: "prod-14",
    name: "Simba Chips Variety 6 Pack",
    description: "Mixed flavour Simba chips snack pack.",
    price: 44.99,
    category_id: "cat-confectionery",
    image_url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop",
    expiry_date: "2026-04-01",
    is_special: false,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-riversdale"],
  },
  // Beverages
  {
    id: "prod-15",
    name: "Coke 2L",
    description: "Coca-Cola Original Taste, 2 litre bottle.",
    price: 22.99,
    category_id: "cat-beverages",
    image_url: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop",
    expiry_date: "2026-05-01",
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  {
    id: "prod-16",
    name: "Ricoffy 750g",
    description: "South Africa's favourite chicory coffee blend.",
    price: 79.99,
    category_id: "cat-beverages",
    image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop",
    expiry_date: "2027-01-01",
    is_special: false,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark"],
  },
  // Electronics
  {
    id: "prod-17",
    name: "Samsung USB-C Charging Cable 1.5m",
    description: "Fast charging USB-C cable, compatible with most Android devices.",
    price: 99.99,
    category_id: "cat-electronics",
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  {
    id: "prod-18",
    name: "Generic Earphones 3.5mm",
    description: "In-ear earphones with built-in microphone.",
    price: 79.99,
    category_id: "cat-electronics",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: false,
    stock_status: "low_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton"],
  },
  // Appliances
  {
    id: "prod-19",
    name: "Russell Hobbs Kettle 1.7L",
    description: "Stainless steel cordless electric kettle.",
    price: 349.99,
    category_id: "cat-appliances",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  // Clothing
  {
    id: "prod-20",
    name: "Plain Cotton T-Shirt (Assorted) L",
    description: "100% cotton crew-neck t-shirt, available in assorted colours.",
    price: 59.99,
    category_id: "cat-clothing",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: false,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark"],
  },
  // Toys
  {
    id: "prod-21",
    name: "Foam Football Set",
    description: "Soft foam football, safe for indoor play.",
    price: 49.99,
    category_id: "cat-toys",
    image_url: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
  // Hardware
  {
    id: "prod-22",
    name: "Stanley Tape Measure 5m",
    description: "Classic yellow Stanley tape measure with metric and imperial.",
    price: 89.99,
    category_id: "cat-hardware",
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: false,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark"],
  },
  // Stationery
  {
    id: "prod-23",
    name: "Croxley A4 Writing Pad 100 Sheets",
    description: "Ruled writing pad, 100 pages, ideal for school or office.",
    price: 29.99,
    category_id: "cat-stationery",
    image_url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark", "branch-riversdale"],
  },
];

export const BANNERS: Banner[] = [
  {
    id: "banner-1",
    branch_id: "branch-meyerton",
    image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop",
    headline: "MASSIVE SAVINGS THIS WEEK",
    subtext: "New stock just landed — grab it before it's gone!",
    link_type: "none",
    link_id: null,
    is_active: true,
    sort_order: 1,
    bg_color: "#1B2B5B",
  },
  {
    id: "banner-2",
    branch_id: "branch-meyerton",
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop",
    headline: "HOUSEHOLD ESSENTIALS",
    subtext: "Stock up and save big on everyday must-haves.",
    link_type: "category",
    link_id: "cat-household",
    is_active: true,
    sort_order: 2,
    bg_color: "#E8212A",
  },
  {
    id: "banner-3",
    branch_id: "branch-riversdale",
    image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop",
    headline: "RIVERSDALE SPECIALS",
    subtext: "Exclusive deals at your local Dismart.",
    link_type: "none",
    link_id: null,
    is_active: true,
    sort_order: 1,
    bg_color: "#1B2B5B",
  },
  {
    id: "banner-4",
    branch_id: "branch-vanderbijlpark",
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop",
    headline: "VDP BIG DEALS",
    subtext: "Vanderbijlpark's best bargains in one place.",
    link_type: "none",
    link_id: null,
    is_active: true,
    sort_order: 1,
    bg_color: "#E8212A",
  },
];

export function getProductsByBranch(branchId: string): Product[] {
  return PRODUCTS.filter((p) => p.branch_ids.includes(branchId));
}

export function getSpecialsByBranch(branchId: string): Product[] {
  return PRODUCTS.filter((p) => p.branch_ids.includes(branchId) && p.is_special);
}

export function getProductsByCategory(branchId: string, categoryId: string): Product[] {
  return PRODUCTS.filter(
    (p) => p.branch_ids.includes(branchId) && p.category_id === categoryId
  );
}

export function getBannersByBranch(branchId: string): Banner[] {
  return BANNERS.filter((b) => b.branch_id === branchId && b.is_active).sort(
    (a, b) => a.sort_order - b.sort_order
  );
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getBranchById(id: string): Branch | undefined {
  return BRANCHES.find((b) => b.id === id);
}
```

- [ ] **Step 2: Create `apps/web/lib/whatsapp.ts`**

```typescript
import type { Branch, Product } from "@dismart/shared";

export function buildWhatsAppLink(branch: Branch, product: Product): string {
  const message = [
    `Hi Dismart ${branch.name}!`,
    ``,
    `I'm interested in the following product:`,
    `*${product.name}*`,
    `Price: R${product.price.toFixed(2)}`,
    ``,
    `Is this item available in store?`,
  ].join("\n");

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${branch.whatsapp_number}?text=${encoded}`;
}

export function buildGeneralWhatsAppLink(branch: Branch): string {
  const message = `Hi Dismart ${branch.name}! I'd like to find out more about your current stock and specials.`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${branch.whatsapp_number}?text=${encoded}`;
}
```

- [ ] **Step 3: Create `apps/web/lib/branch.ts`**

```typescript
import type { Branch } from "@dismart/shared";
import { BRANCHES } from "./mock-data";

const STORAGE_KEY = "dismart_branch_id";
const DEFAULT_BRANCH_ID = "branch-meyerton";

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestBranch(lat: number, lng: number): Branch {
  return BRANCHES.reduce((nearest, branch) => {
    const d = haversineDistance(lat, lng, branch.lat, branch.lng);
    const nd = haversineDistance(lat, lng, nearest.lat, nearest.lng);
    return d < nd ? branch : nearest;
  });
}

export function getSavedBranchId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function saveBranchId(branchId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, branchId);
}

export function detectNearestBranch(): Promise<Branch> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve(BRANCHES.find((b) => b.id === DEFAULT_BRANCH_ID)!);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = getNearestBranch(
          pos.coords.latitude,
          pos.coords.longitude
        );
        resolve(nearest);
      },
      () => {
        resolve(BRANCHES.find((b) => b.id === DEFAULT_BRANCH_ID)!);
      },
      { timeout: 5000 }
    );
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/
git commit -m "feat: add mock data, WhatsApp link builder, and branch detection logic"
```

---

## Task 5: Root Layout and Global Styles

**Files:**
- Create: `apps/web/app/globals.css`
- Create: `apps/web/app/layout.tsx`

- [ ] **Step 1: Create `apps/web/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    -webkit-tap-highlight-color: transparent;
  }

  body {
    @apply bg-white text-gray-900 antialiased;
  }
}

@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

- [ ] **Step 2: Create `apps/web/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Dismart – Discount Salvage Retail",
  description:
    "Find incredible deals on groceries, household, electronics and more at your nearest Dismart branch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/globals.css apps/web/app/layout.tsx
git commit -m "feat: add root layout with Geist font and global styles"
```

---

## Task 6: UI Primitives — Badge and WhatsAppButton

**Files:**
- Create: `apps/web/components/ui/Badge.tsx`
- Create: `apps/web/components/ui/WhatsAppButton.tsx`

- [ ] **Step 1: Create `apps/web/components/ui/Badge.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `apps/web/components/ui/WhatsAppButton.tsx`**

```tsx
interface WhatsAppButtonProps {
  href: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function WhatsAppButton({
  href,
  label = "Enquire on WhatsApp",
  size = "md",
  fullWidth = false,
}: WhatsAppButtonProps) {
  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#17a84f] text-white font-semibold rounded-lg transition-colors ${sizeClasses[size]} ${fullWidth ? "w-full" : ""}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"}
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      {label}
    </a>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/ui/
git commit -m "feat: add Badge and WhatsAppButton UI primitives"
```

---

## Task 7: Header with Branch Selector

**Files:**
- Create: `apps/web/components/layout/Header.tsx`

The Header is a Client Component because it reads localStorage and calls the geolocation API. It shows the DISMART wordmark, a branch selector that auto-detects then allows switching, and the active branch name.

- [ ] **Step 1: Create `apps/web/components/layout/Header.tsx`**

```tsx
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
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-2xl font-black tracking-tight leading-none">
            <span className="text-brand-navy">DIS</span>
            <span className="text-brand-red">MART</span>
          </span>
        </Link>

        {/* Branch selector */}
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/layout/Header.tsx
git commit -m "feat: add Header with DISMART wordmark and auto-detecting branch selector"
```

---

## Task 8: Footer and Sticky WhatsApp Button

**Files:**
- Create: `apps/web/components/layout/Footer.tsx`
- Create: `apps/web/components/layout/StickyWhatsApp.tsx`

- [ ] **Step 1: Create `apps/web/components/layout/Footer.tsx`**

```tsx
import type { Branch } from "@dismart/shared";

interface FooterProps {
  branch: Branch | null;
}

export default function Footer({ branch }: FooterProps) {
  return (
    <footer className="bg-brand-navy text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Logo */}
          <div className="flex-1">
            <span className="text-3xl font-black tracking-tight">
              <span className="text-brand-yellow">DIS</span>
              <span className="text-brand-red">MART</span>
            </span>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">
              Discount salvage retail — incredible deals across Meyerton, Riversdale and Vanderbijlpark.
            </p>
          </div>

          {/* Active branch info */}
          {branch && (
            <div className="flex-1">
              <h3 className="text-brand-yellow font-bold text-sm uppercase tracking-wider mb-3">
                Your Branch — {branch.name}
              </h3>
              <address className="not-italic text-gray-300 text-sm space-y-1">
                <p>{branch.address}</p>
                <p>
                  <a href={`tel:${branch.phone}`} className="hover:text-brand-yellow transition-colors">
                    {branch.phone}
                  </a>
                </p>
              </address>
            </div>
          )}

          {/* Branches list */}
          <div className="flex-1">
            <h3 className="text-brand-yellow font-bold text-sm uppercase tracking-wider mb-3">
              Our Branches
            </h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>Meyerton</li>
              <li>Riversdale</li>
              <li>Vanderbijlpark</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Dismart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Create `apps/web/components/layout/StickyWhatsApp.tsx`**

```tsx
import type { Branch } from "@dismart/shared";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

interface StickyWhatsAppProps {
  branch: Branch | null;
}

export default function StickyWhatsApp({ branch }: StickyWhatsAppProps) {
  if (!branch) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <a
        href={buildGeneralWhatsAppLink(branch)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#17a84f] text-white font-bold px-5 py-3 rounded-full shadow-lg transition-colors"
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp Us
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/layout/
git commit -m "feat: add Footer and StickyWhatsApp layout components"
```

---

## Task 9: ProductCard and ProductGrid

**Files:**
- Create: `apps/web/components/product/ProductCard.tsx`
- Create: `apps/web/components/product/ProductGrid.tsx`

- [ ] **Step 1: Create `apps/web/components/product/ProductCard.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Product, Branch } from "@dismart/shared";
import Badge from "@/components/ui/Badge";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface ProductCardProps {
  product: Product;
  branch: Branch;
}

export default function ProductCard({ product, branch }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <Link href={`/product/${product.id}`} className="relative block aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {product.is_special && (
          <div className="absolute top-2 left-2">
            <Badge variant="special" />
          </div>
        )}
        {product.stock_status === "low_stock" && (
          <div className="absolute top-2 right-2">
            <Badge variant="low-stock" />
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-brand-navy transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xl font-black text-brand-navy mt-auto">
          R{product.price.toFixed(2)}
        </p>
        <WhatsAppButton
          href={buildWhatsAppLink(branch, product)}
          label="Enquire"
          size="sm"
          fullWidth
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/web/components/product/ProductGrid.tsx`**

```tsx
import type { Product, Branch } from "@dismart/shared";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  branch: Branch;
}

export default function ProductGrid({ products, branch }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-8 text-center">
        No products available at this branch right now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} branch={branch} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/product/
git commit -m "feat: add ProductCard and ProductGrid components"
```

---

## Task 10: Home Page Components — CategoryStrip, BannerCard, ProductRow

**Files:**
- Create: `apps/web/components/home/CategoryStrip.tsx`
- Create: `apps/web/components/home/BannerCard.tsx`
- Create: `apps/web/components/home/ProductRow.tsx`

- [ ] **Step 1: Create `apps/web/components/home/CategoryStrip.tsx`**

```tsx
import Link from "next/link";
import type { Category } from "@dismart/shared";

interface CategoryStripProps {
  categories: Category[];
}

export default function CategoryStrip({ categories }: CategoryStripProps) {
  return (
    <section className="bg-white border-b border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-16 h-16 rounded-full bg-brand-yellow/10 border-2 border-brand-yellow/20 group-hover:border-brand-yellow group-hover:bg-brand-yellow/20 transition-all flex items-center justify-center text-3xl">
                {cat.icon_emoji}
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-brand-navy text-center w-16 leading-tight line-clamp-2 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `apps/web/components/home/BannerCard.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@dismart/shared";

interface BannerCardProps {
  banner: Banner;
}

export default function BannerCard({ banner }: BannerCardProps) {
  const href =
    banner.link_type === "category" && banner.link_id
      ? `/category/${banner.link_id}`
      : banner.link_type === "product" && banner.link_id
      ? `/product/${banner.link_id}`
      : null;

  const inner = (
    <div
      className="relative w-full h-44 sm:h-56 md:h-64 rounded-2xl overflow-hidden flex items-center"
      style={{ backgroundColor: banner.bg_color }}
    >
      <Image
        src={banner.image_url}
        alt={banner.headline}
        fill
        className="object-cover opacity-30"
        sizes="(max-width: 1280px) 100vw, 1280px"
        priority
      />
      <div className="relative z-10 px-6 md:px-10 max-w-lg">
        <h2 className="text-white font-black text-2xl sm:text-3xl md:text-4xl leading-tight uppercase">
          {banner.headline}
        </h2>
        {banner.subtext && (
          <p className="text-white/80 text-sm sm:text-base mt-2">{banner.subtext}</p>
        )}
        {href && (
          <span className="inline-block mt-4 bg-brand-yellow text-brand-navy font-bold px-5 py-2 rounded-lg text-sm hover:bg-brand-yellow-dark transition-colors">
            Shop Now
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 my-4">
      {href ? <Link href={href}>{inner}</Link> : inner}
    </div>
  );
}
```

- [ ] **Step 3: Create `apps/web/components/home/ProductRow.tsx`**

```tsx
import Link from "next/link";
import type { Product, Branch } from "@dismart/shared";
import ProductCard from "@/components/product/ProductCard";

interface ProductRowProps {
  title: string;
  products: Product[];
  branch: Branch;
  viewAllHref?: string;
}

export default function ProductRow({ title, products, branch, viewAllHref }: ProductRowProps) {
  if (products.length === 0) return null;

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
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-40 sm:w-48">
            <ProductCard product={product} branch={branch} />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/home/
git commit -m "feat: add CategoryStrip, BannerCard, and ProductRow home page components"
```

---

## Task 11: Home Page

**Files:**
- Create: `apps/web/app/page.tsx`

The home page is a Client Component because branch state drives all data fetching. It composes all home sections in order: Header → CategoryStrip → Banners interleaved with category rows → WhatsApp CTA strip → Footer.

- [ ] **Step 1: Create `apps/web/app/page.tsx`**

```tsx
"use client";

import { useState, useCallback } from "react";
import type { Branch } from "@dismart/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
import CategoryStrip from "@/components/home/CategoryStrip";
import BannerCard from "@/components/home/BannerCard";
import ProductRow from "@/components/home/ProductRow";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import {
  CATEGORIES,
  getBannersByBranch,
  getSpecialsByBranch,
  getProductsByCategory,
} from "@/lib/mock-data";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export default function HomePage() {
  const [branch, setBranch] = useState<Branch | null>(null);

  const handleBranchChange = useCallback((b: Branch) => {
    setBranch(b);
  }, []);

  const banners = branch ? getBannersByBranch(branch.id) : [];
  const specials = branch ? getSpecialsByBranch(branch.id) : [];

  const categoriesWithProducts = branch
    ? CATEGORIES.filter(
        (cat) => getProductsByCategory(branch.id, cat.id).length > 0
      ).sort((a, b) => a.sort_order - b.sort_order)
    : [];

  return (
    <>
      <Header onBranchChange={handleBranchChange} activeBranch={branch} />

      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        {/* Category icon strip */}
        <CategoryStrip categories={CATEGORIES} />

        {/* First banner */}
        {banners[0] && <BannerCard banner={banners[0]} />}

        {/* Specials row */}
        {branch && specials.length > 0 && (
          <ProductRow
            title="Today's Specials"
            products={specials}
            branch={branch}
          />
        )}

        {/* Second banner */}
        {banners[1] && <BannerCard banner={banners[1]} />}

        {/* Category sections — interleave a banner every 3 categories */}
        {branch &&
          categoriesWithProducts.map((cat, index) => (
            <div key={cat.id}>
              <ProductRow
                title={`${cat.icon_emoji} ${cat.name}`}
                products={getProductsByCategory(branch.id, cat.id)}
                branch={branch}
                viewAllHref={`/category/${cat.id}`}
              />
              {/* Insert remaining banners between category sections */}
              {index >= 2 &&
                (index - 2) % 3 === 0 &&
                banners[Math.floor((index - 2) / 3) + 2] && (
                  <BannerCard
                    banner={banners[Math.floor((index - 2) / 3) + 2]}
                  />
                )}
            </div>
          ))}

        {/* WhatsApp CTA strip */}
        {branch && (
          <div className="bg-brand-yellow mx-4 md:mx-auto max-w-7xl rounded-2xl p-6 md:p-10 my-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-brand-navy font-black text-xl md:text-2xl">
                Can't find what you're looking for?
              </h2>
              <p className="text-brand-navy/70 text-sm mt-1">
                Chat directly with our {branch.name} team — we'll help you find it.
              </p>
            </div>
            <WhatsAppButton
              href={buildGeneralWhatsAppLink(branch)}
              label={`Chat with ${branch.name}`}
              size="lg"
            />
          </div>
        )}
      </main>

      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat: build home page with branch-aware specials, banners, and category rows"
```

---

## Task 12: Category Page

**Files:**
- Create: `apps/web/app/category/[id]/page.tsx`

- [ ] **Step 1: Create `apps/web/app/category/[id]/page.tsx`**

```tsx
"use client";

import { useState, useCallback } from "react";
import { use } from "react";
import Link from "next/link";
import type { Branch } from "@dismart/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
import ProductGrid from "@/components/product/ProductGrid";
import {
  CATEGORIES,
  getCategoryById,
  getProductsByCategory,
} from "@/lib/mock-data";
import { getSavedBranchId } from "@/lib/branch";
import { BRANCHES } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const { id } = use(params);
  const [branch, setBranch] = useState<Branch | null>(null);

  const handleBranchChange = useCallback((b: Branch) => {
    setBranch(b);
  }, []);

  const category = getCategoryById(id);
  const products = branch ? getProductsByCategory(branch.id, id) : [];

  return (
    <>
      <Header onBranchChange={handleBranchChange} activeBranch={branch} />
      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
            <span>/</span>
            <span className="text-brand-navy font-semibold">
              {category ? `${category.icon_emoji} ${category.name}` : "Category"}
            </span>
          </nav>

          {/* Category header */}
          {category && (
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-black text-brand-navy uppercase tracking-wide">
                {category.icon_emoji} {category.name}
              </h1>
              {branch && (
                <p className="text-gray-500 text-sm mt-1">
                  Showing products at {branch.name}
                </p>
              )}
            </div>
          )}

          {/* Sidebar + Grid layout on desktop */}
          <div className="flex gap-6">
            {/* Sidebar — category nav on desktop */}
            <aside className="hidden md:block w-48 flex-shrink-0">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Categories
              </h2>
              <nav className="flex flex-col gap-1">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      cat.id === id
                        ? "bg-brand-yellow text-brand-navy"
                        : "text-gray-600 hover:bg-gray-100 hover:text-brand-navy"
                    }`}
                  >
                    <span>{cat.icon_emoji}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              <ProductGrid products={products} branch={branch!} />
            </div>
          </div>
        </div>
      </main>
      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/category/
git commit -m "feat: add category page with sidebar navigation and product grid"
```

---

## Task 13: Product Detail Page

**Files:**
- Create: `apps/web/app/product/[id]/page.tsx`

- [ ] **Step 1: Create `apps/web/app/product/[id]/page.tsx`**

```tsx
"use client";

import { useState, useCallback } from "react";
import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Branch } from "@dismart/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
import Badge from "@/components/ui/Badge";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import ProductRow from "@/components/home/ProductRow";
import {
  getProductById,
  getCategoryById,
  getProductsByCategory,
} from "@/lib/mock-data";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: PageProps) {
  const { id } = use(params);
  const [branch, setBranch] = useState<Branch | null>(null);

  const handleBranchChange = useCallback((b: Branch) => {
    setBranch(b);
  }, []);

  const product = getProductById(id);
  const category = product ? getCategoryById(product.category_id) : null;
  const related = branch && product
    ? getProductsByCategory(branch.id, product.category_id)
        .filter((p) => p.id !== product.id)
        .slice(0, 8)
    : [];

  return (
    <>
      <Header onBranchChange={handleBranchChange} activeBranch={branch} />
      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
            <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  href={`/category/${category.id}`}
                  className="hover:text-brand-navy transition-colors"
                >
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-brand-navy font-semibold line-clamp-1">
              {product?.name ?? "Product"}
            </span>
          </nav>

          {!product ? (
            <p className="text-gray-500 text-center py-20">Product not found.</p>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative aspect-square md:w-96 md:flex-shrink-0 bg-gray-50">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 384px"
                      priority
                    />
                    {product.is_special && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="special" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-6 md:p-8 flex flex-col gap-4 flex-1">
                    {category && (
                      <Link
                        href={`/category/${category.id}`}
                        className="text-xs font-bold text-brand-red uppercase tracking-widest hover:underline"
                      >
                        {category.icon_emoji} {category.name}
                      </Link>
                    )}
                    <h1 className="text-2xl md:text-3xl font-black text-brand-navy leading-tight">
                      {product.name}
                    </h1>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {product.description}
                    </p>
                    <p className="text-4xl font-black text-brand-navy">
                      R{product.price.toFixed(2)}
                    </p>

                    {product.stock_status === "low_stock" && (
                      <p className="text-orange-600 text-sm font-semibold">
                        ⚠ Low stock — enquire quickly!
                      </p>
                    )}
                    {product.stock_status === "out_of_stock" && (
                      <p className="text-brand-red text-sm font-semibold">
                        Out of stock at this branch
                      </p>
                    )}

                    {branch && product.stock_status !== "out_of_stock" && (
                      <div className="mt-2">
                        <WhatsAppButton
                          href={buildWhatsAppLink(branch, product)}
                          label={`Enquire at ${branch.name}`}
                          size="lg"
                          fullWidth
                        />
                        <p className="text-xs text-gray-400 text-center mt-2">
                          No purchase required — just ask!
                        </p>
                      </div>
                    )}

                    {product.expiry_date && (
                      <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                        Best before: {new Date(product.expiry_date).toLocaleDateString("en-ZA")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Related products */}
              {branch && related.length > 0 && (
                <div className="mt-10">
                  <ProductRow
                    title={`More in ${category?.name ?? "this category"}`}
                    products={related}
                    branch={branch}
                    viewAllHref={category ? `/category/${category.id}` : undefined}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/product/
git commit -m "feat: add product detail page with WhatsApp enquiry and related products"
```

---

## Task 14: Branch Info Page

**Files:**
- Create: `apps/web/app/branch/page.tsx`

- [ ] **Step 1: Create `apps/web/app/branch/page.tsx`**

```tsx
"use client";

import { useState, useCallback } from "react";
import type { Branch } from "@dismart/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
import ProductGrid from "@/components/product/ProductGrid";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { getProductsByBranch } from "@/lib/mock-data";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export default function BranchPage() {
  const [branch, setBranch] = useState<Branch | null>(null);

  const handleBranchChange = useCallback((b: Branch) => {
    setBranch(b);
  }, []);

  const products = branch ? getProductsByBranch(branch.id) : [];

  return (
    <>
      <Header onBranchChange={handleBranchChange} activeBranch={branch} />
      <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {branch ? (
            <>
              {/* Branch hero */}
              <div className="bg-brand-navy text-white rounded-2xl p-6 md:p-10 mb-8">
                <h1 className="text-3xl font-black text-brand-yellow uppercase">
                  {branch.name}
                </h1>
                <address className="not-italic text-gray-300 text-sm mt-2 space-y-1">
                  <p>{branch.address}</p>
                  <p>
                    <a href={`tel:${branch.phone}`} className="hover:text-brand-yellow transition-colors">
                      {branch.phone}
                    </a>
                  </p>
                </address>
                <div className="mt-4">
                  <WhatsAppButton
                    href={buildGeneralWhatsAppLink(branch)}
                    label={`Chat with ${branch.name}`}
                    size="md"
                  />
                </div>
              </div>

              {/* All products */}
              <h2 className="text-xl font-black text-brand-navy uppercase tracking-wide mb-4">
                All Products at {branch.name}
              </h2>
              <ProductGrid products={products} branch={branch} />
            </>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              Detecting your branch...
            </div>
          )}
        </div>
      </main>
      <Footer branch={branch} />
      <StickyWhatsApp branch={branch} />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/branch/
git commit -m "feat: add branch info page with full product grid"
```

---

## Task 15: Verify Dev Server Runs

- [ ] **Step 1: Install all dependencies from the monorepo root**

```bash
cd "c:\Personal Projects\Tiaan\dismart"
pnpm install
```

- [ ] **Step 2: Start the dev server**

```bash
pnpm dev
```

Expected: Next.js dev server starts on `http://localhost:3000` with no TypeScript or module resolution errors.

- [ ] **Step 3: Verify pages load**

Open in browser and check:
- `http://localhost:3000` — home page loads, branch auto-detects (shows "Detecting..." then "Meyerton"), category strip visible, banners visible, product rows visible
- `http://localhost:3000/category/cat-groceries` — grocery products shown, sidebar category list visible on desktop
- `http://localhost:3000/product/prod-1` — product detail with WhatsApp button
- `http://localhost:3000/branch` — branch hero + full product grid

- [ ] **Step 4: Check mobile responsiveness**

In Chrome DevTools, switch to mobile viewport (375px). Verify:
- Sticky WhatsApp button visible at bottom right
- Product cards display in 2-column grid
- Category strip scrolls horizontally
- Header branch selector accessible

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete Dismart /apps/web public storefront with mock data"
```
