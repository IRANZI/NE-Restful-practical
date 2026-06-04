import { z } from 'zod';
import { INSPECTION_STATUSES } from '../config/constants';
import { dateTimeSchema } from './shared.schemas';

export const scheduleInspectionSchema = z.object({
  extinguisherId: z.string().uuid(),
  inspectorId: z.string().uuid().nullable().optional(),
  scheduledFor: dateTimeSchema,
  notes: z.string().trim().max(1000).optional()
});

export const updateInspectionSchema = z
  .object({
    inspectorId: z.string().uuid().nullable().optional(),
    scheduledFor: dateTimeSchema.optional(),
    status: z.enum(INSPECTION_STATUSES).optional(),
    result: z.string().trim().max(80).nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required.'
  });

export const completeInspectionSchema = z.object({
  result: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(1000).optional()
});

export const inspectionQuerySchema = z.object({
  status: z.enum(INSPECTION_STATUSES).optional(),
  extinguisherId: z.string().uuid().optional(),
  inspectorId: z.string().uuid().optional()
});
