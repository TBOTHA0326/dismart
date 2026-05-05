import {
  Apple, Baby, Bath, Beef, BookOpen, Broom, Car, Carrot, ChefHat,
  Coffee, Cookie, Cpu, Dumbbell, Fish, Flower2, Gamepad2, Gift,
  GlassWater, Globe, Ham, HeartPulse, Home, Lamp, Layers,
  Leaf, Milk, Music, Paintbrush, Pencil, Pill, Plug, Scissors,
  Shirt, ShoppingBasket, Smartphone, Snowflake, Sofa, Sparkles,
  Star, Sun, Tv, UtensilsCrossed, Waves, Wine, Wrench, Zap,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Apple, Baby, Bath, Beef, BookOpen, Broom, Car, Carrot, ChefHat,
  Coffee, Cookie, Cpu, Dumbbell, Fish, Flower2, Gamepad2, Gift,
  GlassWater, Globe, Ham, HeartPulse, Home, Lamp, Layers,
  Leaf, Milk, Music, Paintbrush, Pencil, Pill, Plug, Scissors,
  Shirt, ShoppingBasket, Smartphone, Snowflake, Sofa, Sparkles,
  Star, Sun, Tv, UtensilsCrossed, Waves, Wine, Wrench, Zap,
};

export const CATEGORY_ICONS = Object.keys(icons);

interface CategoryIconProps {
  name: string;
  className?: string;
}

export default function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon = icons[name] ?? ShoppingBasket;
  return <Icon aria-hidden="true" className={className} strokeWidth={2.25} />;
}
