import { z } from 'zod';

export const sendEmailSchema = z.object({
  to: z.string().trim().email(),
  subject: z.string().trim().min(2).max(220),
  text: z.string().trim().min(2).max(4000),
  html: z.string().trim().max(8000).optional()
});
