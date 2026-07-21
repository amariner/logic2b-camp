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
export const apiPost = <T>(path: string, body: unknown, headers?: Record<string, string>) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body), headers });
export const apiPatch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
export const apiPut = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
export const apiDelete = <T>(path: string) => request<T>(path, { method: 'DELETE' });

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
  /** "en casa" (ADR 0022) se deriva de estos dos, no del status */
  checkedInAt: string | null;
  checkedOutAt: string | null;
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

// ---------- tipos de /api/admin/map (el plano — ADR 0021, C7) ----------

import type { PlanoDescriptor } from '@logic-camp/config';
export type { PlanoDescriptor };
/** `plano: null` = el camping no tiene geometría propia → el dashboard degrada a autoPlano. */
export type MapData = { plano: PlanoDescriptor | null };

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
  birthdate: string | null;
  nationality: string | null;
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
  checkedInAt: string | null;
  checkedOutAt: string | null;
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
  checkedInAt: string | null;
  checkedOutAt: string | null;
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

export type CatalogUnitType = PlanningUnitType & {
  capacityMin: number;
  capacityMax: number;
  includedPersons: number;
};

export type ExtraItem = {
  id: string;
  nameI18n: Record<string, string>;
  priceCents: number;
  per: 'stay' | 'night' | 'person';
  required: boolean;
};

export type Catalog = { unitTypes: CatalogUnitType[]; units: PlanningUnit[]; extras: ExtraItem[] };

// ---------- tipos de /api/admin/rates ----------

export type Season = {
  id: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  priority: number;
};

export type RatePlan = {
  id: string;
  unitTypeId: string;
  seasonId: string;
  baseCents: number;
  extraPersonCents: number;
  childCents: number;
  petCents: number;
  electricityCents: number;
  vehicleCents: number;
  minStay: number;
  maxStay: number | null;
  arrivalDays: number[] | null;
  departureDays: number[] | null;
};

export type RatesData = { ratePlans: RatePlan[]; seasons: Season[] };

// ---------- tipos de /api/admin/guests (clientes) ----------

export type GuestListItem = {
  id: string;
  name: string;
  surname: string;
  email: string | null;
  phone: string | null;
  docType: string | null;
  docNumber: string | null;
  nationality: string | null;
  bookingsCount: number;
  lastStay: string | null;
};

export type GuestBooking = {
  id: string;
  code: string;
  status: BookingDetail['status'];
  dateFrom: string;
  dateTo: string;
  totalCents: number;
  channel: BookingDetail['channel'];
  isLead: boolean;
};

export type GuestDetail = Omit<GuestListItem, 'bookingsCount' | 'lastStay'> & {
  address: string | null;
  gdprConsentAt: string | null;
  bookings: GuestBooking[];
};

// ---------- tipos de /api/admin/reports ----------

export type ReportsData = {
  from: string;
  to: string;
  nights: number;
  occupancy: {
    unitTypeId: string;
    units: number;
    occupiedNights: number;
    capacityNights: number;
    occupancyPct: number;
  }[];
  revenue: { totalCents: number; paidCents: number; bookings: number };
  arrivals: number;
  departures: number;
};

// ---------- tipos de /api/admin/settings ----------

export type TenantSettings = {
  id: string;
  slug: string;
  name: string;
  tier: number;
  timezone: string;
  currency: string;
  locales: string[];
  modules: Record<string, unknown>;
};

// ---------- tipos de /api/admin/notifications (log) ----------

export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'disabled';

export type NotificationLogItem = {
  id: string;
  bookingId: string | null;
  enquiryId: string | null;
  channel: 'email' | 'whatsapp';
  template: string;
  status: NotificationStatus;
  attempts: number;
  sentAt: string | null;
  createdAt: string | null;
  bookingCode: string | null;
  enquiryContact: { name: string; email: string } | null;
};

// ---------- tipos de /api/admin/payments (log) ----------

export type PaymentLogItem = {
  id: string;
  bookingId: string;
  bookingCode: string;
  provider: 'stripe' | 'redsys' | 'manual' | 'none';
  providerRef: string | null;
  amountCents: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  createdAt: string;
};

// ---------- tipos de POST /api/quote (cotización en vivo del alta manual) ----------

export type QuoteResponse = {
  nights: number;
  breakdown: {
    lines: PriceLine[];
    totalCents: number;
    touristTaxCents: number;
    currency: string;
  };
};
