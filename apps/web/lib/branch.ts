import { getNearestBranch, type Branch } from "@dismart/shared";

const STORAGE_KEY = "dismart_branch_id";

export function getSavedBranchId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function saveBranchId(branchId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, branchId);
}

export function detectNearestBranch(branches: Branch[]): Promise<Branch> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation || branches.length === 0) {
      resolve(branches[0]);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = getNearestBranch(branches, pos.coords.latitude, pos.coords.longitude);
        resolve(nearest ?? branches[0]);
      },
      () => resolve(branches[0]),
      { timeout: 5000 }
    );
  });
}
