import type { Branch } from "@dismart/shared";
import { MessageCircle } from "lucide-react";
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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-colors hover:bg-[#1ebe5d] active:bg-[#17a84f]"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </a>
    </div>
  );
}
