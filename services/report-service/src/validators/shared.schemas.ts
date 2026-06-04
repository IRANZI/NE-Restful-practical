import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid()
});

export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format.')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, 'Date must be a real calendar date.');

export const dateTimeSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Date and time must be valid.'
});
