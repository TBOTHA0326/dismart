import { getNearestBranch, type Branch } from "@dismart/shared";
import { BRANCHES } from "./mock-data";

const STORAGE_KEY = "dismart_branch_id";
const DEFAULT_BRANCH_ID = "branch-meyerton";

export function getDefaultBranch(): Branch {
  return BRANCHES.find((b) => b.id === DEFAULT_BRANCH_ID)!;
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
      resolve(getDefaultBranch());
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = getNearestBranch(
          BRANCHES,
          pos.coords.latitude,
          pos.coords.longitude
        );
        resolve(nearest ?? getDefaultBranch());
      },
      () => {
        resolve(getDefaultBranch());
      },
      { timeout: 5000 }
    );
  });
}
