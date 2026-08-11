import type { Building } from "../types/building";

export async function fetchBuildings(): Promise<Building[]> {
  const response = await fetch("/api/buildings");

  if (!response.ok) {
    throw new Error(
      `건물 목록 조회 실패: ${response.status}`
    );
  }

  return response.json() as Promise<Building[]>;
}