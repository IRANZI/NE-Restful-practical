import { z } from 'zod';
import { dateOnlySchema } from './shared.schemas';

export const createMaintenanceLogSchema = z.object({
  extinguisherId: z.string().uuid(),
  inspectorId: z.string().uuid().nullable().optional(),
  actionTaken: z.string().trim().min(3).max(1200),
  issuesIdentified: z.string().trim().max(1200).optional(),
  notes: z.string().trim().max(1200).optional(),
  maintenanceDate: dateOnlySchema
});

export const maintenanceQuerySchema = z.object({
  extinguisherId: z.string().uuid().optional(),
  inspectorId: z.string().uuid().optional()
});
