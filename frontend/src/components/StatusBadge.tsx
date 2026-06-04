import type { ExtinguisherStatus, InspectionStatus } from '../types';

type Status = ExtinguisherStatus | InspectionStatus | 'Compliant' | 'Attention Required';

const statusTone: Record<string, string> = {
  Active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Compliant: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Scheduled: 'border-sky-200 bg-sky-50 text-sky-700',
  'Needs Inspection': 'border-amber-200 bg-amber-50 text-amber-800',
  'Attention Required': 'border-amber-200 bg-amber-50 text-amber-800',
  Overdue: 'border-red-200 bg-red-50 text-red-700',
  Expired: 'border-red-200 bg-red-50 text-red-700',
  'In Maintenance': 'border-violet-200 bg-violet-50 text-violet-700',
  Cancelled: 'border-zinc-200 bg-zinc-100 text-zinc-600',
  Retired: 'border-zinc-200 bg-zinc-100 text-zinc-600'
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge ${statusTone[status] ?? statusTone.Retired}`}>{status}</span>;
}
