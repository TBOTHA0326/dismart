import {
  Baby,
  Bath,
  Coffee,
  Cookie,
  Gamepad2,
  HeartPulse,
  Home,
  Pencil,
  Plug,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Baby,
  Bath,
  Coffee,
  Cookie,
  Gamepad2,
  HeartPulse,
  Home,
  Pencil,
  Plug,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Wrench,
};

interface CategoryIconProps {
  name: string;
  className?: string;
}

export default function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon = icons[name] ?? ShoppingBasket;
  return <Icon aria-hidden="true" className={className} strokeWidth={2.25} />;
}
