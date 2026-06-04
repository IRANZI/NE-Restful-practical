import { createHttpError } from '../../../utils/http-error';
import { query } from '../db/client';
import { getExtinguisherSnapshot } from './extinguisher-client';

export interface MaintenanceRecord {
  id: string;
  extinguisherId: string;
  serialNumber: string;
  location: string;
  inspectorId: string | null;
  inspectorName: string | null;
  actionTaken: string;
  issuesIdentified: string | null;
  notes: string | null;
  maintenanceDate: string;
  createdAt: Date;
}

interface CreateMaintenanceInput {
  extinguisherId: string;
  inspectorId?: string | null;
  actionTaken: string;
  issuesIdentified?: string;
  notes?: string;
  maintenanceDate: string;
}

function selectMaintenanceSql(whereClause = '') {
  return `SELECT id,
                 extinguisher_id AS "extinguisherId",
                 serial_number AS "serialNumber",
                 location,
                 inspector_id AS "inspectorId",
                 inspector_name AS "inspectorName",
                 action_taken AS "actionTaken",
                 issues_identified AS "issuesIdentified",
                 notes,
                 maintenance_date AS "maintenanceDate",
                 created_at AS "createdAt"
            FROM maintenance_logs
           ${whereClause}`;
}

export async function listMaintenance(filters: {
  extinguisherId?: string;
  inspectorId?: string;
}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.extinguisherId) {
    values.push(filters.extinguisherId);
    conditions.push(`extinguisher_id = $${values.length}`);
  }

  if (filters.inspectorId) {
    values.push(filters.inspectorId);
    conditions.push(`inspector_id = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query<MaintenanceRecord>(
    `${selectMaintenanceSql(whereClause)} ORDER BY maintenance_date DESC, created_at DESC`,
    values
  );

  return result.rows;
}

export async function getMaintenanceById(id: string) {
  const result = await query<MaintenanceRecord>(selectMaintenanceSql('WHERE id = $1'), [id]);
  const log = result.rows[0];

  if (!log) {
    throw createHttpError('Maintenance log was not found.', 404);
  }

  return log;
}

export async function createMaintenanceLog(input: CreateMaintenanceInput) {
  const extinguisher = await getExtinguisherSnapshot(input.extinguisherId);
  const result = await query<{ id: string }>(
    `INSERT INTO maintenance_logs
      (extinguisher_id, serial_number, location, inspector_id, action_taken, issues_identified, notes, maintenance_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      input.extinguisherId,
      extinguisher.serialNumber,
      extinguisher.location,
      input.inspectorId ?? null,
      input.actionTaken,
      input.issuesIdentified ?? null,
      input.notes ?? null,
      input.maintenanceDate
    ]
  );

  return getMaintenanceById(result.rows[0].id);
}

export async function getRecentMaintenance(limit = 5) {
  const result = await query<Record<string, unknown>>(
    `SELECT id,
            serial_number AS "serialNumber",
            location,
            action_taken AS "actionTaken",
            maintenance_date AS "maintenanceDate",
            created_at AS "createdAt"
       FROM maintenance_logs
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit]
  );

  return result.rows;
}

export async function exportMaintenanceRows() {
  const result = await query<Record<string, unknown>>(
    `SELECT serial_number AS "serialNumber",
            location,
            action_taken AS "actionTaken",
            issues_identified AS "issuesIdentified",
            notes,
            maintenance_date AS "maintenanceDate",
            created_at AS "createdAt"
       FROM maintenance_logs
      ORDER BY maintenance_date DESC, created_at DESC`
  );

  return result.rows;
}
