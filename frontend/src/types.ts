export type UserRole = 'Admin' | 'Inspector' | 'User';
export type ExtinguisherType = 'Water' | 'CO2' | 'Foam' | 'Dry Chemical';
export type ExtinguisherSize = '1.5 lb' | '5 lb' | '9 lb' | '12 lb';
export type ExtinguisherStatus =
  | 'Active'
  | 'Needs Inspection'
  | 'Expired'
  | 'In Maintenance'
  | 'Retired';
export type InspectionStatus = 'Scheduled' | 'Completed' | 'Overdue' | 'Cancelled';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Extinguisher {
  id: string;
  serialNumber: string;
  location: string;
  type: ExtinguisherType;
  size: ExtinguisherSize;
  installationDate: string;
  expiryDate: string;
  status: ExtinguisherStatus;
  assignedTo?: string | null;
  assignedInspectorName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExtinguisherPayload {
  serialNumber: string;
  location: string;
  type: ExtinguisherType;
  size: ExtinguisherSize;
  installationDate: string;
  expiryDate: string;
  status: ExtinguisherStatus;
  assignedTo?: string | null;
}

export interface Inspection {
  id: string;
  extinguisherId: string;
  serialNumber: string;
  location: string;
  inspectorId?: string | null;
  inspectorName?: string | null;
  scheduledFor: string;
  status: InspectionStatus;
  result?: string | null;
  notes?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLog {
  id: string;
  extinguisherId: string;
  serialNumber: string;
  location: string;
  inspectorId?: string | null;
  inspectorName?: string | null;
  actionTaken: string;
  issuesIdentified?: string | null;
  notes?: string | null;
  maintenanceDate: string;
  createdAt: string;
}

export interface ReportSummary {
  inventory: {
    total: number;
    byStatus: Array<{ status: ExtinguisherStatus; total: number }>;
    byType: Array<{ type: ExtinguisherType; total: number }>;
  };
  inspections: Array<{ status: InspectionStatus; total: number }>;
  compliance: {
    expired: number;
    upcomingExpirations: number;
    overdueInspections: number;
    status: 'Compliant' | 'Attention Required';
  };
  recentMaintenance: Array<{
    id: string;
    serialNumber: string;
    location: string;
    actionTaken: string;
    maintenanceDate: string;
    createdAt: string;
  }>;
}

export interface ApiEnvelope<T> {
  message: string;
  data: T;
}
