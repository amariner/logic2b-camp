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
export const apiPatch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

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

// ---------- tipos de /api/admin/bookings/:id (la ficha) ----------

export type PriceLine = {
  concept: string;
  detail: Record<string, string | number>;
  amountCents: number;
};

export type BookingGuest = {
  id: string;
  name: string;
  surname: string;
  email: string | null;
  phone: string | null;
  docType: string | null;
  docNumber: string | null;
  isLead: boolean;
};

export type BookingPayment = {
  id: string;
  provider: 'stripe' | 'redsys' | 'manual' | 'none';
  /** Con signo: reembolso = negativo. sum == paidCents */
  amountCents: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  createdAt: string;
};

export type BookingDetail = {
  id: string;
  code: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed';
  channel: 'web' | 'phone' | 'walkin' | 'import';
  dateFrom: string;
  dateTo: string;
  unitTypeId: string;
  unitId: string | null;
  unitCode: string | null;
  occupancy: { adults: number; childrenAges: number[]; pets: number; vehicles: number };
  priceBreakdown: {
    lines: PriceLine[];
    totalCents: number;
    touristTaxCents: number;
    currency: string;
  };
  totalCents: number;
  paidCents: number;
  touristTaxCents: number;
  depositCents: number;
  notes: string | null;
  locale: string;
  createdAt: string;
  guests: BookingGuest[];
  payments: BookingPayment[];
};

// ---------- tipos de /api/admin/bookings (lista) ----------

export type BookingListItem = {
  id: string;
  code: string;
  status: BookingDetail['status'];
  channel: BookingDetail['channel'];
  dateFrom: string;
  dateTo: string;
  unitTypeId: string;
  unitId: string | null;
  unitCode: string | null;
  leadName: string | null;
  occupancy: { adults: number; childrenAges: number[]; pets: number; vehicles: number };
  totalCents: number;
  paidCents: number;
  notes: string | null;
  createdAt: string;
};

// ---------- tipos de /api/admin/enquiries ----------

export type EnquiryStatus = 'new' | 'contacted' | 'quoted' | 'converted' | 'lost';

export type EnquiryItem = {
  id: string;
  status: EnquiryStatus;
  dateFrom: string | null;
  dateTo: string | null;
  occupancy: { adults: number; childrenAges: number[]; pets: number; vehicles: number } | null;
  unitTypeId: string | null;
  message: string;
  contact: { name: string; email: string; phone?: string; locale?: string };
  locale: string;
  source: string;
  convertedBookingId: string | null;
  createdAt: string;
};

// ---------- tipos de /api/admin/catalog ----------

export type Catalog = { unitTypes: PlanningUnitType[]; units: PlanningUnit[] };
