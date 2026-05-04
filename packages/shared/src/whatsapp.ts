import type { Branch, Product } from "./types";

export function buildWhatsAppLink(branch: Branch, product: Product): string {
  const message = [
    `Hi Dismart ${branch.name}!`,
    "",
    "I'm interested in the following product:",
    `*${product.name}*`,
    `Price: R${product.price.toFixed(2)}`,
    "",
    "Is this item available in store?",
  ].join("\n");

  return `https://wa.me/${branch.whatsapp_number}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralWhatsAppLink(branch: Branch): string {
  const message = `Hi Dismart ${branch.name}! I'd like to find out more about your current stock and specials.`;
  return `https://wa.me/${branch.whatsapp_number}?text=${encodeURIComponent(message)}`;
}
