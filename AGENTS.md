# DISMART – Codex DEVELOPER SPECIFICATION

## 1. PROJECT OVERVIEW

Dismart is a branch-based discount salvage retail platform designed to display fast-moving stock and specials across multiple physical store locations. The system is not an e-commerce platform. There are no payments or delivery features. The primary goal is to drive in-store sales and WhatsApp enquiries.

The platform supports multiple branches, initially:
- Meyerton
- Riversdale
- Vanderbijlpark

The system consists of:
1. Public-facing customer web application
2. Internal CMS (admin panel) built within the same Next.js project
3. Supabase backend (auth, database, storage)

---

## 2. CORE TECHNOLOGY STACK

- Next.js (App Router)
- React with TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth, Storage)
- Hosted on Vercel
- Monorepo setup (single repository containing both public app and CMS, deployed as separate applications)

- Next.js (App Router)
- React with TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth, Storage)

---

## 3. CORE PRINCIPLES

- Mobile-first design is mandatory
- Speed and simplicity over complexity
- No checkout, cart, or payment logic
- WhatsApp is the primary conversion mechanism
- Branch-based data separation is critical
- CMS must be usable by non-technical staff

---

## 4. SYSTEM ARCHITECTURE

### Frontend
- Next.js App Router structure
- Server Components where possible
- Client components only for interactivity (filters, CMS actions)
- Tailwind for styling
- Optimised image handling via Next/Image or Supabase CDN

### Backend
- Supabase Postgres database
- Supabase Auth for internal users
- Row Level Security (RLS) enforced on all tables
- Supabase Storage for product images

---

## 5. BRANCH LOGIC (CRITICAL)

### Public Users
The system must automatically determine the user's nearest branch using:
1. Browser geolocation API (primary)
2. Fallback: manual branch selection

Once detected:
- Store selected branch in local storage
- Default all product queries to that branch
- Allow user to switch branches at any time via UI

### Internal Users (CMS)
- Users log in via Supabase Auth
- Each user has a `branch_id` assigned in the database
- On login:
  - System automatically sets active branch context to user's assigned branch
  - Users cannot access other branches unless they are admins

### Admin Users
- Can switch between all branches freely
- Have global visibility across system

---

## 6. DATABASE DESIGN (SUPABASE)

### branches
- id (uuid)
- name (text)
- location (text)
- address (text)
- whatsapp_number (text)
- phone (text)
- is_active (boolean)

---

### products
- id (uuid)
- name (text)
- description (text)
- price (numeric)
- category_id (uuid)
- image_url (text)
- expiry_date (date, nullable)
- is_special (boolean)
- stock_status (text)
- created_at (timestamp)

---

### product_branches
Many-to-many relationship
- id (uuid)
- product_id (uuid)
- branch_id (uuid)

---

### categories
- id (uuid)
- name (text)
- icon_url (text, nullable) — used in the home page category icon strip
- sort_order (int) — controls display order in strip and category sections

---

### profiles (internal users)
- id (uuid, matches Supabase auth user id)
- full_name (text)
- role (text: admin | branch_manager)
- branch_id (uuid, nullable for admin)

---

### enquiries
- id (uuid)
- product_id (uuid)
- branch_id (uuid)
- created_at (timestamp)
- source (text: whatsapp | web)

---

## 7. PUBLIC APPLICATION STRUCTURE

### Pages

#### /
- Auto-detect branch
- Category icon strip (horizontal scrollable tiles)
- CMS-managed specials banners (full-width cards between sections)
- Specials product row (products where `is_special = true`)
- Category sections with horizontal product rows
- Sticky WhatsApp CTA button

#### /category/[id]
- Category-specific product grid filtered to active branch
- Sidebar category navigation on desktop

#### /branch
- Branch overview and contact details
- All active categories and products for that branch

#### /product/[id]
- Product details, image, price
- WhatsApp deep link enquiry button
- Related products in same category (same branch)

---

## 8. CMS STRUCTURE (/admin)

### Dashboard
- Total active products
- Specials overview
- Expiring soon items

### Products
- Create / edit products
- Assign to multiple branches
- Upload images
- Toggle specials (`is_special` flag)
- Set expiry date for time-sensitive stock

### Categories
- Create and manage categories
- Upload category icon image (used in the home page category strip)
- Reorder categories (controls display order in strip and on home page)

### Banners (Specials Promotions)
- Create / edit full-width promotional banner cards
- Upload banner image
- Set headline and subtext
- Link banner to a category or product (optional)
- Activate / deactivate banners
- Reorder banners (controls home page display order)
- Branch managers see only their branch banners; admins see all

### Branch Management (Admin only)
- Add/edit branches
- Activate/deactivate branches

### Users
- Assign users to branches
- Set roles (admin / branch_manager)

---

## 9. WHATSAPP INTEGRATION

Each product must include a WhatsApp enquiry button:

Message format:
- Product name
- Branch name
- Optional price

System generates a deep link to WhatsApp using branch-specific numbers.

---

## 10. UI / UX REQUIREMENTS

### Design Inspiration
The overall visual design is inspired by Checkers Sixty60's retail interface — a clean, fast, category-driven browsing experience with strong visual hierarchy and bold product presentation. Strip out all loyalty, delivery, and cart-related UI patterns. Adapt the retail browsing aesthetic for a discount salvage store context.

Key Checkers Sixty60 patterns to adopt:
- Top navigation bar with branch selector (replacing delivery address)
- Horizontal scrollable category icon strip below the header (Quick Shops equivalent)
- Large full-width promotional banner cards between content sections (CMS-managed)
- Product sections grouped by category with "View All" links
- Horizontally scrollable product card rows per category on mobile
- Bold price display with savings/special badges on product cards
- Clean white background with strong use of the brand accent colour

What to strip out:
- No delivery time badges or delivery options
- No loyalty points or rewards UI
- No cart, basket, or checkout elements
- No "Add to cart" buttons — replace with WhatsApp enquiry button

### Design System
- Clean card-based layout inspired by fast retail browsing
- Strong visual hierarchy for pricing and specials
- Bold savings badges on products marked `is_special = true`
- Accent colour used consistently for CTAs, badges, and highlights
- Category icons displayed as circular icon tiles in a horizontal strip

### Home Page Layout Structure (/)
Sections appear in this order, all filtered to the active branch:
1. **Header** — logo, branch selector, search bar (future)
2. **Category Icon Strip** — horizontally scrollable circular tiles, one per category (from `categories` table)
3. **Specials Banner** — large full-width CMS-managed promotional banner card (image + headline + CTA)
4. **Specials Product Row** — horizontally scrollable row of products where `is_special = true`
5. **Category Sections** — one section per active category, each with a heading, "View All" link, and a horizontal product card row
6. **WhatsApp CTA Banner** — full-width strip prompting users to enquire via WhatsApp

Specials banners are managed through the CMS and can be updated without code changes. Each banner supports: image, headline text, subtext, optional link to a category or product.

### CMS: Specials Banners Table (new)
Add a `banners` table to Supabase:
- id (uuid)
- branch_id (uuid)
- image_url (text)
- headline (text)
- subtext (text, nullable)
- link_type (text: category | product | none)
- link_id (uuid, nullable)
- is_active (boolean)
- sort_order (int)

CMS must allow branch managers to create, reorder, and deactivate banners for their branch. Admins can manage banners across all branches.

### Mobile First
- Single column layout on mobile
- Horizontally scrollable product rows (not grid) for category sections on mobile
- Sticky WhatsApp action button at bottom of screen
- Thumb-friendly spacing (min 44px tap targets)
- Category strip scrolls horizontally without visible scrollbar

### Desktop
- Multi-column product grid within each category section
- Sidebar category filter on /branch and /category pages
- Faster navigation between categories via sticky category strip
- Promotional banners display at full width with image on right, text on left

---

## 11. BRANCH SELECTION LOGIC (FRONTEND)

Priority order:
1. User geolocation -> nearest branch
2. Saved local storage branch
3. CMS assigned branch (internal users)
4. Manual selection fallback

Branch switching must:
- Re-fetch products
- Update UI context
- Persist selection in local storage

---

## 12. SUPABASE SECURITY RULES (RLS)

- Public users: read-only access to products and branches
- CMS users: restricted to assigned branch unless admin
- Admin users: full access across all tables

---

## 13. PERFORMANCE REQUIREMENTS

- Server-side rendering for product feeds
- Lazy loading images
- Minimise client-side JavaScript
- Cache branch-based product queries

---

## 14. FUTURE EXTENSIONS

- Stock automation alerts (expiry tracking)
- QR code scanning for in-store updates
- PWA support for offline browsing
- Analytics dashboard (best selling categories)
- Real-time stock updates via Supabase subscriptions

---

## 15. DEVELOPMENT GUIDELINES

- Keep components modular and reusable
- Avoid over-engineering CMS features early
- Prioritise speed and simplicity over abstraction
- All business logic must respect branch context
- Never expose cross-branch data to non-admin users

---

## 16. FINAL ARCHITECTURAL RULE

Everything in the system must resolve around one principle:

Branch-first data filtering is mandatory across all queries, components, and API calls.


## 17. MONOREPO STRUCTURE (VERCEL DEPLOYMENT)

The project must use a monorepo setup to manage both the public-facing application and the internal CMS from a single repository while deploying them as separate Vercel applications.

### Repository Structure

/apps
  /web        -> Public customer-facing application (Next.js)
  /admin      -> Internal CMS application (Next.js)

/packages
  /shared     -> Shared components, utilities, types, and constants

### Applications

#### /apps/web
- Public Dismart storefront
- Branch-based product browsing
- WhatsApp enquiry system
- Mobile-first UX

#### /apps/admin
- Internal CMS system
- Authentication via Supabase Auth
- Role-based access (admin / branch manager)
- Product, branch, category management

#### /packages/shared
- Shared UI components (buttons, cards, modals)
- Shared TypeScript types (Product, Branch, User)
- Utility functions (branch detection, formatting, WhatsApp link builder)

### Deployment (Vercel)

Each application must be deployed independently on Vercel:

- /apps/web -> Dismart public domain (primary customer site)
- /apps/admin -> admin.dismart domain (CMS access only)

Both deployments originate from the same Git repository.

### Environment Management

Each app must maintain separate environment variables:

- /apps/web -> public Supabase keys + branch config
- /apps/admin -> Supabase service role key + auth config

Shared environment variables must be avoided unless explicitly required.

### Shared Logic Rules

- All branch filtering logic must live in /packages/shared
- WhatsApp link generation must be shared
- Product and branch TypeScript types must be single-source-of-truth

### Architectural Rule

Even though the system is split into two deployed applications, all business logic must remain consistent through shared packages. No duplication of core logic between web and admin apps is allowed.
