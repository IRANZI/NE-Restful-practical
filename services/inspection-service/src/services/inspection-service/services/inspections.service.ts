import { createHttpError } from '../../../utils/http-error';
import { query } from '../db/client';
import { getExtinguisherSnapshot } from './extinguisher-client';

export interface InspectionRecord {
  id: string;
  extinguisherId: string;
  serialNumber: string;
  location: string;
  inspectorId: string | null;
  inspectorName: string | null;
  createdBy: string | null;
  scheduledFor: Date;
  status: string;
  result: string | null;
  notes: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ScheduleInspectionInput {
  extinguisherId: string;
  inspectorId?: string | null;
  scheduledFor: string;
  notes?: string;
}

interface UpdateInspectionInput {
  inspectorId?: string | null;
  scheduledFor?: string;
  status?: string;
  result?: string | null;
  notes?: string | null;
}

function selectInspectionSql(whereClause = '') {
  return `SELECT id,
                 extinguisher_id AS "extinguisherId",
                 serial_number AS "serialNumber",
                 location,
                 inspector_id AS "inspectorId",
                 inspector_name AS "inspectorName",
                 created_by AS "createdBy",
                 scheduled_for AS "scheduledFor",
                 CASE
                   WHEN status = 'Scheduled' AND scheduled_for < NOW() THEN 'Overdue'
                   ELSE status
                 END AS "status",
                 result,
                 notes,
                 completed_at AS "completedAt",
                 created_at AS "createdAt",
                 updated_at AS "updatedAt"
            FROM inspections
           ${whereClause}`;
}

export async function listInspections(filters: {
  status?: string;
  extinguisherId?: string;
  inspectorId?: string;
}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.status) {
    if (filters.status === 'Overdue') {
      conditions.push(`status = 'Scheduled' AND scheduled_for < NOW()`);
    } else {
      values.push(filters.status);
      conditions.push(`status = $${values.length}`);
    }
  }

  if (filters.extinguisherId) {
    values.push(filters.extinguisherId);
    conditions.push(`extinguisher_id = $${values.length}`);
  }

  if (filters.inspectorId) {
    values.push(filters.inspectorId);
    conditions.push(`inspector_id = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query<InspectionRecord>(
    `${selectInspectionSql(whereClause)} ORDER BY scheduled_for DESC`,
    values
  );

  return result.rows;
}

export async function getInspectionById(id: string) {
  const result = await query<InspectionRecord>(selectInspectionSql('WHERE id = $1'), [id]);
  const inspection = result.rows[0];

  if (!inspection) {
    throw createHttpError('Inspection was not found.', 404);
  }

  return inspection;
}

export async function scheduleInspection(input: ScheduleInspectionInput, createdBy: string) {
  const extinguisher = await getExtinguisherSnapshot(input.extinguisherId);
  const result = await query<{ id: string }>(
    `INSERT INTO inspections
      (extinguisher_id, serial_number, location, inspector_id, created_by, scheduled_for, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      input.extinguisherId,
      extinguisher.serialNumber,
      extinguisher.location,
      input.inspectorId ?? null,
      createdBy,
      new Date(input.scheduledFor),
      input.notes ?? null
    ]
  );

  return getInspectionById(result.rows[0].id);
}

export async function updateInspection(id: string, input: UpdateInspectionInput) {
  const columnMap: Record<keyof UpdateInspectionInput, string> = {
    inspectorId: 'inspector_id',
    scheduledFor: 'scheduled_for',
    status: 'status',
    result: 'result',
    notes: 'notes'
  };

  const assignments: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(input) as [keyof UpdateInspectionInput, unknown][]) {
    if (value !== undefined) {
      values.push(key === 'scheduledFor' && typeof value === 'string' ? new Date(value) : value);
      assignments.push(`${columnMap[key]} = $${values.length}`);
    }
  }

  values.push(id);

  const result = await query(
    `UPDATE inspections
        SET ${assignments.join(', ')},
            updated_at = NOW()
      WHERE id = $${values.length}`,
    values
  );

  if (result.rowCount === 0) {
    throw createHttpError('Inspection was not found.', 404);
  }

  return getInspectionById(id);
}

export async function completeInspection(id: string, resultText: string, notes?: string) {
  const result = await query(
    `UPDATE inspections
        SET status = 'Completed',
            result = $1,
            notes = COALESCE($2, notes),
            completed_at = NOW(),
            updated_at = NOW()
      WHERE id = $3`,
    [resultText, notes ?? null, id]
  );

  if (result.rowCount === 0) {
    throw createHttpError('Inspection was not found.', 404);
  }

  return getInspectionById(id);
}

export async function getInspectionSummary() {
  const result = await query<{ status: string; total: string }>(
    `SELECT CASE
              WHEN status = 'Scheduled' AND scheduled_for < NOW() THEN 'Overdue'
              ELSE status
            END AS status,
            COUNT(*)::text AS total
       FROM inspections
      GROUP BY 1
      ORDER BY 1`
  );

  return result.rows.map((row) => ({ status: row.status, total: Number(row.total) }));
}
