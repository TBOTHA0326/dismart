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
  icon_name: string;
  icon_url?: string | null;
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

export interface DealPamphlet {
  id: string;
  branch_id: string;
  title: string;
  description: string | null;
  asset_url: string;
  asset_type: "image" | "pdf" | "external_url";
  source: "upload" | "image_url" | "facebook_url" | "other_url";
  thumbnail_url: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
}

export interface Profile {
  id: string;
  full_name: string;
  role: "super_admin" | "admin" | "branch_manager";
  branch_id: string | null;
}

export interface Enquiry {
  id: string;
  product_id: string;
  branch_id: string;
  created_at: string;
  source: "whatsapp" | "web";
}
