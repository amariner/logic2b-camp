import { z } from 'zod';

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD');

export const occupancySchema = z.object({
  adults: z.number().int().min(1).max(20),
  childrenAges: z.array(z.number().int().min(0).max(17)).max(20).default([]),
  pets: z.number().int().min(0).max(10).default(0),
  vehicles: z.number().int().min(0).max(5).default(1),
});

export const availabilityQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
  adults: z.coerce.number().int().min(1).max(20).default(2),
  children: z.coerce.number().int().min(0).max(20).default(0),
  pets: z.coerce.number().int().min(0).max(10).default(0),
});

export const quoteRequestSchema = z.object({
  unitTypeId: z.string().min(1),
  dateFrom: isoDate,
  dateTo: isoDate,
  occupancy: occupancySchema,
  extraIds: z.array(z.string()).max(20).default([]),
  needsElectricity: z.boolean().default(false),
  withElectricity: z.boolean().default(false),
});

export const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
});

export const enquiryRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  contact: contactSchema,
  locale: z.string().min(2).max(5).default('es'),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  occupancy: occupancySchema.optional(),
  unitTypeId: z.string().optional(),
  source: z.string().max(40).default('web'),
});

export const bookingRequestSchema = z.object({
  unitTypeId: z.string().min(1),
  dateFrom: isoDate,
  dateTo: isoDate,
  occupancy: occupancySchema,
  extraIds: z.array(z.string()).max(20).default([]),
  withElectricity: z.boolean().default(false),
  needsElectricity: z.boolean().default(false),
  holder: contactSchema,
  locale: z.string().min(2).max(5).default('es'),
  notes: z.string().max(2000).optional(),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type EnquiryRequest = z.infer<typeof enquiryRequestSchema>;
export type BookingRequest = z.infer<typeof bookingRequestSchema>;
