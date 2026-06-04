import type { ExtinguisherSize, ExtinguisherStatus, ExtinguisherType, InspectionStatus, UserRole } from '../types';

export const userRoles: UserRole[] = ['Admin', 'Inspector', 'User'];
export const extinguisherTypes: ExtinguisherType[] = ['Water', 'CO2', 'Foam', 'Dry Chemical'];
export const extinguisherSizes: ExtinguisherSize[] = ['1.5 lb', '5 lb', '9 lb', '12 lb'];
export const extinguisherStatuses: ExtinguisherStatus[] = [
  'Active',
  'Needs Inspection',
  'Expired',
  'In Maintenance',
  'Retired'
];
export const inspectionStatuses: InspectionStatus[] = [
  'Scheduled',
  'Completed',
  'Overdue',
  'Cancelled'
];
