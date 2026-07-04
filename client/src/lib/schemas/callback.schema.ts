import { z } from 'zod';

// Calendly's onEventScheduled payload exposes only canonical event/invitee URIs
// (no name/email without a Calendly API token) — see react-calendly's
// EventScheduledEvent type. Both are required so the admin alert can look the
// booking up in Calendly; there is no invitee-identifying data to validate further.
export const callbackSchema = z.object({
  eventUri: z.string().url('Invalid Calendly event reference.'),
  inviteeUri: z.string().url('Invalid Calendly invitee reference.'),
});

export type CallbackData = z.infer<typeof callbackSchema>;
