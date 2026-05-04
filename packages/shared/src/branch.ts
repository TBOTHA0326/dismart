import type { Branch } from "./types";

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearestBranch(
  branches: Branch[],
  lat: number,
  lng: number
): Branch | null {
  const activeBranches = branches.filter((branch) => branch.is_active);
  if (activeBranches.length === 0) return null;

  return activeBranches.reduce((nearest, branch) => {
    const distance = haversineDistance(lat, lng, branch.lat, branch.lng);
    const nearestDistance = haversineDistance(lat, lng, nearest.lat, nearest.lng);
    return distance < nearestDistance ? branch : nearest;
  });
}
