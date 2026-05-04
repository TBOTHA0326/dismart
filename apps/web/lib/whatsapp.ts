import type { Branch, Product } from "@dismart/shared";

export function buildWhatsAppLink(branch: Branch, product: Product): string {
  const message = [
    `Hi Dismart ${branch.name}!`,
    ``,
    `I'm interested in the following product:`,
    `*${product.name}*`,
    `Price: R${product.price.toFixed(2)}`,
    ``,
    `Is this item available in store?`,
  ].join("\n");

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${branch.whatsapp_number}?text=${encoded}`;
}

export function buildGeneralWhatsAppLink(branch: Branch): string {
  const message = `Hi Dismart ${branch.name}! I'd like to find out more about your current stock and specials.`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${branch.whatsapp_number}?text=${encoded}`;
}
