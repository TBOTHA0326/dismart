import type { Branch } from "@dismart/shared";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppCTABannerProps {
  branch: Branch;
}

export default function WhatsAppCTABanner({ branch }: WhatsAppCTABannerProps) {
  return (
    <section className="bg-brand-navy py-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-white">Got a question?</p>
            <p className="text-xs text-white/60">{branch.name} &mdash; {branch.whatsapp_number}</p>
          </div>
          <WhatsAppButton
            href={buildGeneralWhatsAppLink(branch)}
            label="Chat Now"
            size="sm"
          />
        </div>
      </div>
    </section>
  );
}
