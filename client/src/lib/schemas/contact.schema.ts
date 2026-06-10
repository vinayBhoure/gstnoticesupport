import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Please enter your full name (at least 2 characters).'),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.'),
  email: z
    .string()
    .email('Enter a valid email address.'),
  query: z
    .string()
    .min(20, 'Please describe your query (at least 20 characters).'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
