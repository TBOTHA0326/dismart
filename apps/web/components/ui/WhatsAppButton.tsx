import { MessageCircle } from "lucide-react";

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
      <MessageCircle
        className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}
        aria-hidden="true"
      />
      {label}
    </a>
  );
}
