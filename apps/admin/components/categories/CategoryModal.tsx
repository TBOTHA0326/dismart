"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Category } from "@dismart/shared";
import {
  Apple, Baby, Bath, Beef, BookOpen, Broom, Car, Carrot, ChefHat,
  Coffee, Cookie, Cpu, Dumbbell, Fish, Flower2, Gamepad2, Gift,
  GlassWater, Globe, Ham, HeartPulse, Home, Lamp, Layers,
  Leaf, Milk, Music, Paintbrush, Pencil, Pill, Plug, Scissors,
  Shirt, ShoppingBasket, Smartphone, Snowflake, Sofa, Sparkles,
  Star, Sun, Tv, UtensilsCrossed, Waves, Wine, Wrench, Zap,
  type LucideIcon,
} from "lucide-react";

const input = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-base md:text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10";

const ICONS: Record<string, LucideIcon> = {
  Apple, Baby, Bath, Beef, BookOpen, Broom, Car, Carrot, ChefHat,
  Coffee, Cookie, Cpu, Dumbbell, Fish, Flower2, Gamepad2, Gift,
  GlassWater, Globe, Ham, HeartPulse, Home, Lamp, Layers,
  Leaf, Milk, Music, Paintbrush, Pencil, Pill, Plug, Scissors,
  Shirt, ShoppingBasket, Smartphone, Snowflake, Sofa, Sparkles,
  Star, Sun, Tv, UtensilsCrossed, Waves, Wine, Wrench, Zap,
};

const ICON_LABELS: Record<string, string> = {
  Apple: "Fruit", Baby: "Baby", Bath: "Bath", Beef: "Meat", BookOpen: "Books",
  Broom: "Cleaning", Car: "Auto", Carrot: "Vegetables", ChefHat: "Cooking",
  Coffee: "Coffee", Cookie: "Biscuits", Cpu: "Electronics", Dumbbell: "Fitness",
  Fish: "Fish", Flower2: "Garden", Gamepad2: "Gaming", Gift: "Gifts",
  GlassWater: "Drinks", Globe: "General", Ham: "Deli", HeartPulse: "Health",
  Home: "Home", Lamp: "Lighting", Layers: "Mixed", Leaf: "Organic",
  Milk: "Dairy", Music: "Music", Paintbrush: "DIY", Pencil: "Stationery",
  Pill: "Pharmacy", Plug: "Electrical", Scissors: "Crafts", Shirt: "Clothing",
  ShoppingBasket: "Grocery", Smartphone: "Phones", Snowflake: "Frozen",
  Sofa: "Furniture", Sparkles: "Specials", Star: "Featured", Sun: "Outdoor",
  Tv: "TV", UtensilsCrossed: "Kitchenware", Waves: "Beverages", Wine: "Alcohol",
  Wrench: "Hardware", Zap: "Electrical",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  nextSortOrder: number;
  category?: Category;
}

export default function CategoryModal({ open, onClose, onSaved, nextSortOrder, category }: Props) {
  const editing = !!category;
  const [form, setForm] = useState({
    name: category?.name ?? "",
    icon_name: category?.icon_name ?? "ShoppingBasket",
  });
  const [iconSearch, setIconSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: category?.name ?? "",
      icon_name: category?.icon_name ?? "ShoppingBasket",
    });
    setIconSearch("");
    setError(null);
  }, [open, category]);

  const filteredIcons = Object.entries(ICONS).filter(([key]) =>
    iconSearch.trim() === "" ||
    key.toLowerCase().includes(iconSearch.toLowerCase()) ||
    (ICON_LABELS[key] ?? "").toLowerCase().includes(iconSearch.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createBrowserSupabaseClient()!;
    const payload = {
      name: form.name,
      icon_name: form.icon_name,
      icon_url: null,
      sort_order: editing ? category.sort_order : nextSortOrder,
    };

    const { error: err } = editing
      ? await supabase.from("categories").update(payload).eq("id", category.id)
      : await supabase.from("categories").insert(payload);

    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Category" : "New Category"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Category name" htmlFor="cat-name">
          <input id="cat-name" className={input} placeholder="e.g. Groceries" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </FormField>

        <FormField label="Icon" htmlFor="cat-icon-search" hint="Pick an icon for the category strip">
          <div className="space-y-2">
            <input
              id="cat-icon-search"
              className={input}
              placeholder="Search icons…"
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
            />
            <div className="grid grid-cols-6 gap-1.5 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-2">
              {filteredIcons.map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  title={ICON_LABELS[name] ?? name}
                  onClick={() => setForm((p) => ({ ...p, icon_name: name }))}
                  className={`flex flex-col items-center gap-1 rounded-lg p-2 transition ${
                    form.icon_name === name
                      ? "bg-brand-navy text-white"
                      : "text-gray-500 hover:bg-white hover:text-brand-navy hover:shadow-sm"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                  <span className="text-[9px] font-bold leading-tight text-center truncate w-full">
                    {ICON_LABELS[name] ?? name}
                  </span>
                </button>
              ))}
              {filteredIcons.length === 0 && (
                <p className="col-span-6 py-4 text-center text-xs text-gray-400">No icons match.</p>
              )}
            </div>
          </div>
        </FormField>

        {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{error}</p>}

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-brand-navy py-2.5 text-sm font-bold text-white hover:bg-brand-navy/90 transition disabled:opacity-60">
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
