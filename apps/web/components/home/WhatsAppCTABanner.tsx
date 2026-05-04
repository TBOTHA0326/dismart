import type { Branch } from "@dismart/shared";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppCTABannerProps {
  branch: Branch;
}

export default function WhatsAppCTABanner({ branch }: WhatsAppCTABannerProps) {
  return (
    <section className="bg-brand-navy py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              Got a question? Chat to us on WhatsApp
            </h2>
            <p className="mt-2 text-base text-white/70">
              {branch.name} branch &mdash; {branch.whatsapp_number}
            </p>
          </div>
          <WhatsAppButton
            href={buildGeneralWhatsAppLink(branch)}
            label="Chat Now"
            size="lg"
          />
        </div>
      </div>
    </section>
  );
}
