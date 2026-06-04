export const USER_ROLES = ['Admin', 'Inspector', 'User'] as const;
export const EXTINGUISHER_TYPES = ['Water', 'CO2', 'Foam', 'Dry Chemical'] as const;
export const EXTINGUISHER_SIZES = ['1.5 lb', '5 lb', '9 lb', '12 lb'] as const;
export const EXTINGUISHER_STATUSES = [
  'Active',
  'Needs Inspection',
  'Expired',
  'In Maintenance',
  'Retired'
] as const;
export const INSPECTION_STATUSES = ['Scheduled', 'Completed', 'Overdue', 'Cancelled'] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type ExtinguisherType = (typeof EXTINGUISHER_TYPES)[number];
export type ExtinguisherSize = (typeof EXTINGUISHER_SIZES)[number];
export type ExtinguisherStatus = (typeof EXTINGUISHER_STATUSES)[number];
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];
