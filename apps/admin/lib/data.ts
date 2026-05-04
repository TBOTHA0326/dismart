import type {
  Banner,
  Branch,
  Category,
  DealPamphlet,
  Product,
  Profile,
} from "@dismart/shared";

export const branches: Branch[] = [
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

export const categories: Category[] = [
  { id: "cat-groceries", name: "Groceries", icon_name: "ShoppingBasket", sort_order: 1 },
  { id: "cat-household", name: "Household", icon_name: "Home", sort_order: 2 },
  { id: "cat-cleaning", name: "Cleaning", icon_name: "Sparkles", sort_order: 3 },
  { id: "cat-personal-care", name: "Personal Care", icon_name: "HeartPulse", sort_order: 4 },
  { id: "cat-beverages", name: "Beverages", icon_name: "Coffee", sort_order: 5 },
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Jungle Oats 1kg",
    description: "Classic rolled oats.",
    price: 39.99,
    category_id: "cat-groceries",
    image_url: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=400&fit=crop",
    expiry_date: "2026-12-01",
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-riversdale"],
  },
  {
    id: "prod-2",
    name: "Handy Andy Multi-Purpose 750ml",
    description: "Cream cleaner for household surfaces.",
    price: 29.99,
    category_id: "cat-cleaning",
    image_url: "https://images.unsplash.com/photo-1585586723682-168e3b2a9370?w=400&h=400&fit=crop",
    expiry_date: null,
    is_special: true,
    stock_status: "in_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-meyerton", "branch-vanderbijlpark"],
  },
  {
    id: "prod-3",
    name: "Coke 2L",
    description: "Coca-Cola Original Taste.",
    price: 22.99,
    category_id: "cat-beverages",
    image_url: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop",
    expiry_date: "2026-05-01",
    is_special: false,
    stock_status: "low_stock",
    created_at: "2026-01-01T00:00:00Z",
    branch_ids: ["branch-riversdale", "branch-vanderbijlpark"],
  },
];

export const banners: Banner[] = [
  {
    id: "banner-1",
    branch_id: "branch-meyerton",
    image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop",
    headline: "MASSIVE SAVINGS THIS WEEK",
    subtext: "New stock just landed.",
    link_type: "none",
    link_id: null,
    is_active: true,
    sort_order: 1,
    bg_color: "#1B2B5B",
  },
];

export const deals: DealPamphlet[] = [
  {
    id: "deal-meyerton-weekly",
    branch_id: "branch-meyerton",
    title: "Weekly Savings Pamphlet",
    description: "Image, PDF or social URL for the public deals module.",
    asset_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=900&fit=crop",
    asset_type: "image",
    source: "image_url",
    thumbnail_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=500&fit=crop",
    is_active: true,
    starts_at: "2026-05-04T00:00:00Z",
    ends_at: null,
    sort_order: 1,
  },
];

// IMPORTANT: profiles[0] must remain super_admin — Tasks 9, 10, 11 depend on this order
// for the mock session simulation. Replace with real auth session when Supabase Auth is wired.
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
