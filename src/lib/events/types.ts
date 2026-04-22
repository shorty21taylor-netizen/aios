import { z } from "zod";

export const EventTypeEnum = z.enum([
  "call.inbound.received",
  "call.inbound.answered",
  "call.booked",
  "sms.outbound.sent",
  "sms.inbound.received",
  "sms.booked",
  "quote.sent",
  "email.outbound.sent",
  "email.inbound.replied",
  "email.booked",
  "booking.created",
  "deal.closed",
]);

export type EventType = z.infer<typeof EventTypeEnum>;

export const EventPayloadSchema = z.object({
  event_type: EventTypeEnum,
  occurred_at: z.coerce.date(),
  correlation_id: z.string().optional(),
  idempotency_key: z.string(),
  data: z.record(z.unknown()),
});

export type EventPayload = z.infer<typeof EventPayloadSchema>;

export interface BookingCreateData {
  contact_name: string;
  contact_phone?: string;
  contact_email?: string;
  booking_slot: string;
  estimated_value?: number;
}

export interface DealClosedData {
  booking_id: string;
  amount_closed: number;
}
