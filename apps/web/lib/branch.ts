import type { Branch } from "@dismart/shared";
import { BRANCHES } from "./mock-data";

const STORAGE_KEY = "dismart_branch_id";
const DEFAULT_BRANCH_ID = "branch-meyerton";

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestBranch(lat: number, lng: number): Branch {
  return BRANCHES.reduce((nearest, branch) => {
    const d = haversineDistance(lat, lng, branch.lat, branch.lng);
    const nd = haversineDistance(lat, lng, nearest.lat, nearest.lng);
    return d < nd ? branch : nearest;
  });
}

export function getSavedBranchId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function saveBranchId(branchId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, branchId);
}

export function detectNearestBranch(): Promise<Branch> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve(BRANCHES.find((b) => b.id === DEFAULT_BRANCH_ID)!);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = getNearestBranch(
          pos.coords.latitude,
          pos.coords.longitude
        );
        resolve(nearest);
      },
      () => {
        resolve(BRANCHES.find((b) => b.id === DEFAULT_BRANCH_ID)!);
      },
      { timeout: 5000 }
    );
  });
}
