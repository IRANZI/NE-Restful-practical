import { env } from '../../../config/env';
import { requestJson } from '../../../shared/service-http';
import { query } from '../db/client';

function csvEscape(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  const text = value instanceof Date ? value.toISOString() : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv<T extends Record<string, unknown>>(rows: T[], columns: [keyof T, string][]) {
  const header = columns.map(([, label]) => csvEscape(label)).join(',');
  const body = rows.map((row) => columns.map(([key]) => csvEscape(row[key])).join(',')).join('\n');
  return [header, body].filter(Boolean).join('\n');
}

interface InventorySummary {
  total: number;
  byStatus: Array<{ status: string; total: number }>;
  byType: Array<{ type: string; total: number }>;
  expired: number;
  upcomingExpirations: number;
}

export async function getReportSummary() {
  const [inventory, inspections, recentMaintenance] = await Promise.all([
    requestJson<InventorySummary>(
      `${env.serviceUrls.extinguishers}/internal/reports/inventory-summary`
    ),
    requestJson<Array<{ status: string; total: number }>>(
      `${env.serviceUrls.inspections}/internal/reports/inspection-summary`
    ),
    requestJson<Array<Record<string, unknown>>>(
      `${env.serviceUrls.inspections}/internal/reports/recent-maintenance`
    )
  ]);

  const overdueInspectionCount = Number(
    inspections.find((row) => row.status === 'Overdue')?.total ?? 0
  );

  const summary = {
    inventory: {
      total: inventory.total,
      byStatus: inventory.byStatus,
      byType: inventory.byType
    },
    inspections,
    compliance: {
      expired: inventory.expired,
      upcomingExpirations: inventory.upcomingExpirations,
      overdueInspections: overdueInspectionCount,
      status:
        inventory.expired + overdueInspectionCount > 0 ? 'Attention Required' : 'Compliant'
    },
    recentMaintenance
  };

  await query(
    `INSERT INTO report_snapshots (report_type, payload)
     VALUES ($1, $2)`,
    ['summary', summary]
  );

  return summary;
}

export async function exportInventoryCsv() {
  const rows = await requestJson<Array<Record<string, unknown>>>(
    `${env.serviceUrls.extinguishers}/internal/reports/inventory-rows`
  );

  return toCsv(rows, [
    ['serialNumber', 'Serial Number'],
    ['location', 'Location'],
    ['type', 'Type'],
    ['size', 'Size'],
    ['installationDate', 'Installation Date'],
    ['expiryDate', 'Expiry Date'],
    ['status', 'Status'],
    ['createdAt', 'Created At']
  ]);
}

export async function exportMaintenanceCsv() {
  const rows = await requestJson<Array<Record<string, unknown>>>(
    `${env.serviceUrls.inspections}/internal/reports/maintenance-rows`
  );

  return toCsv(rows, [
    ['serialNumber', 'Serial Number'],
    ['location', 'Location'],
    ['actionTaken', 'Action Taken'],
    ['issuesIdentified', 'Issues Identified'],
    ['notes', 'Notes'],
    ['maintenanceDate', 'Maintenance Date'],
    ['createdAt', 'Created At']
  ]);
}
