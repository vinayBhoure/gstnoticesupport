import { z } from 'zod';

export const supportSchema = z.object({
  title: z
    .string()
    .min(3, 'Please enter a title (at least 3 characters).')
    .max(120, 'Title must be under 120 characters.'),
  message: z
    .string()
    .min(20, 'Please describe your issue (at least 20 characters).')
    .max(4000, 'Message must be under 4000 characters.'),
});

export type SupportFormData = z.infer<typeof supportSchema>;
