/** Cliente fino de /api/admin: misma-origen, cookie de sesión, errores tipados. */

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`api_${status}`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  return (await res.json()) as T;
}

export const apiGet = <T>(path: string) => request<T>(path);
export const apiPost = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });

// ---------- tipos de /api/admin/planning (el SELECT del tape chart) ----------

export type PlanningUnitType = {
  id: string;
  kind: 'pitch' | 'lodging';
  nameI18n: Record<string, string>;
};
export type PlanningUnit = { id: string; unitTypeId: string; code: string; status: string };
export type PlanningBooking = {
  id: string;
  code: string;
  status: 'pending' | 'confirmed' | 'no_show' | 'completed';
  unitTypeId: string;
  unitId: string | null;
  dateFrom: string;
  dateTo: string;
  occupancy: { adults: number; childrenAges: number[] };
};
export type PlanningBlock = {
  id: string;
  unitId: string | null;
  unitTypeId: string | null;
  dateFrom: string;
  dateTo: string;
  reason: 'maintenance' | 'owner' | 'longstay' | 'manual';
};
export type PlanningData = {
  from: string;
  to: string;
  unitTypes: PlanningUnitType[];
  units: PlanningUnit[];
  bookings: PlanningBooking[];
  blocks: PlanningBlock[];
};
