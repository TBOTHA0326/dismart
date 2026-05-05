import type { Product, ReservationStatus } from "./types";

export const RESERVATION_STATUSES: ReservationStatus[] = [
  "PENDING",
  "CONTACTED",
  "CONFIRMED",
  "COLLECTED",
  "EXPIRED",
  "CANCELLED",
  "NOT_COLLECTED",
];

export const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  "PENDING",
  "CONTACTED",
  "CONFIRMED",
];

export function getAvailableStock(product: Pick<Product, "stock_quantity" | "reserved_quantity">): number {
  return Math.max(0, product.stock_quantity - product.reserved_quantity);
}

export function isReservable(product: Pick<Product, "stock_quantity" | "reserved_quantity" | "stock_status">): boolean {
  return product.stock_status !== "out_of_stock" && getAvailableStock(product) > 0;
}

export function getReservationStatusLabel(status: ReservationStatus): string {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
