import { z } from 'zod';
import {
  EXTINGUISHER_SIZES,
  EXTINGUISHER_STATUSES,
  EXTINGUISHER_TYPES
} from '../config/constants';
import { dateOnlySchema } from './shared.schemas';

const baseExtinguisherSchema = z.object({
  serialNumber: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[A-Za-z0-9-]+$/, 'Serial number can contain letters, numbers, and hyphens.'),
  location: z.string().trim().min(2).max(180),
  type: z.enum(EXTINGUISHER_TYPES),
  size: z.enum(EXTINGUISHER_SIZES),
  installationDate: dateOnlySchema,
  expiryDate: dateOnlySchema,
  status: z.enum(EXTINGUISHER_STATUSES),
  assignedTo: z.string().uuid().nullable().optional()
});

function hasValidExpiryDates(payload: {
  installationDate?: string;
  expiryDate?: string;
}) {
  if (!payload.installationDate || !payload.expiryDate) {
    return true;
  }

  return new Date(payload.expiryDate) > new Date(payload.installationDate);
}

export const createExtinguisherSchema = baseExtinguisherSchema.refine(hasValidExpiryDates, {
  path: ['expiryDate'],
  message: 'Expiry date must be after the installation date.'
});

export const updateExtinguisherSchema = baseExtinguisherSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required.'
  })
  .refine(hasValidExpiryDates, {
    path: ['expiryDate'],
    message: 'Expiry date must be after the installation date.'
  });

export const extinguisherQuerySchema = z.object({
  status: z.enum(EXTINGUISHER_STATUSES).optional(),
  search: z.string().trim().optional()
});
