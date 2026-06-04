import { ExtinguisherSize, ExtinguisherStatus, ExtinguisherType } from '../../../config/constants';
import { createHttpError } from '../../../utils/http-error';
import { query } from '../db/client';

export interface ExtinguisherRecord {
  id: string;
  serialNumber: string;
  location: string;
  type: ExtinguisherType;
  size: ExtinguisherSize;
  installationDate: string;
  expiryDate: string;
  status: ExtinguisherStatus;
  assignedTo: string | null;
  assignedInspectorName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateExtinguisherInput {
  serialNumber: string;
  location: string;
  type: ExtinguisherType;
  size: ExtinguisherSize;
  installationDate: string;
  expiryDate: string;
  status: ExtinguisherStatus;
  assignedTo?: string | null;
}

type UpdateExtinguisherInput = Partial<CreateExtinguisherInput>;

function selectExtinguisherSql(whereClause = '') {
  return `SELECT id,
                 serial_number AS "serialNumber",
                 location,
                 type,
                 size,
                 installation_date AS "installationDate",
                 expiry_date AS "expiryDate",
                 status,
                 assigned_to AS "assignedTo",
                 NULL::text AS "assignedInspectorName",
                 created_at AS "createdAt",
                 updated_at AS "updatedAt"
            FROM extinguishers
           ${whereClause}`;
}

export async function listExtinguishers(filters: { status?: string; search?: string }) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`(serial_number ILIKE $${values.length} OR location ILIKE $${values.length})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query<ExtinguisherRecord>(
    `${selectExtinguisherSql(whereClause)} ORDER BY created_at DESC`,
    values
  );

  return result.rows;
}

export async function getExtinguisherById(id: string) {
  const result = await query<ExtinguisherRecord>(selectExtinguisherSql('WHERE id = $1'), [id]);
  const extinguisher = result.rows[0];

  if (!extinguisher) {
    throw createHttpError('Fire extinguisher was not found.', 404);
  }

  return extinguisher;
}

export async function createExtinguisher(input: CreateExtinguisherInput) {
  try {
    const result = await query<ExtinguisherRecord>(
      `INSERT INTO extinguishers
        (serial_number, location, type, size, installation_date, expiry_date, status, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id,
                 serial_number AS "serialNumber",
                 location,
                 type,
                 size,
                 installation_date AS "installationDate",
                 expiry_date AS "expiryDate",
                 status,
                 assigned_to AS "assignedTo",
                 NULL::text AS "assignedInspectorName",
                 created_at AS "createdAt",
                 updated_at AS "updatedAt"`,
      [
        input.serialNumber,
        input.location,
        input.type,
        input.size,
        input.installationDate,
        input.expiryDate,
        input.status,
        input.assignedTo ?? null
      ]
    );

    return result.rows[0];
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      throw createHttpError('A fire extinguisher with this serial number already exists.', 409);
    }

    throw error;
  }
}

export async function updateExtinguisher(id: string, input: UpdateExtinguisherInput) {
  const columnMap: Record<keyof UpdateExtinguisherInput, string> = {
    serialNumber: 'serial_number',
    location: 'location',
    type: 'type',
    size: 'size',
    installationDate: 'installation_date',
    expiryDate: 'expiry_date',
    status: 'status',
    assignedTo: 'assigned_to'
  };

  const assignments: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(input) as [keyof UpdateExtinguisherInput, unknown][]) {
    if (value !== undefined) {
      values.push(value);
      assignments.push(`${columnMap[key]} = $${values.length}`);
    }
  }

  if (assignments.length === 0) {
    return getExtinguisherById(id);
  }

  values.push(id);

  try {
    const result = await query(
      `UPDATE extinguishers
          SET ${assignments.join(', ')},
              updated_at = NOW()
        WHERE id = $${values.length}`,
      values
    );

    if (result.rowCount === 0) {
      throw createHttpError('Fire extinguisher was not found.', 404);
    }

    return getExtinguisherById(id);
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      throw createHttpError('A fire extinguisher with this serial number already exists.', 409);
    }

    throw error;
  }
}

export async function deleteExtinguisher(id: string) {
  const result = await query('DELETE FROM extinguishers WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    throw createHttpError('Fire extinguisher was not found.', 404);
  }
}

export async function getInventorySummary() {
  const [total, byStatus, byType, expired, upcomingExpirations] = await Promise.all([
    query<{ total: string }>('SELECT COUNT(*)::text AS total FROM extinguishers'),
    query<{ status: ExtinguisherStatus; total: string }>(
      `SELECT status, COUNT(*)::text AS total FROM extinguishers GROUP BY status ORDER BY status`
    ),
    query<{ type: ExtinguisherType; total: string }>(
      `SELECT type, COUNT(*)::text AS total FROM extinguishers GROUP BY type ORDER BY type`
    ),
    query<{ total: string }>(
      `SELECT COUNT(*)::text AS total
         FROM extinguishers
        WHERE expiry_date < CURRENT_DATE OR status = 'Expired'`
    ),
    query<{ total: string }>(
      `SELECT COUNT(*)::text AS total
         FROM extinguishers
        WHERE expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`
    )
  ]);

  return {
    total: Number(total.rows[0]?.total ?? 0),
    byStatus: byStatus.rows.map((row) => ({ status: row.status, total: Number(row.total) })),
    byType: byType.rows.map((row) => ({ type: row.type, total: Number(row.total) })),
    expired: Number(expired.rows[0]?.total ?? 0),
    upcomingExpirations: Number(upcomingExpirations.rows[0]?.total ?? 0)
  };
}

export async function exportInventoryRows() {
  const result = await query<Record<string, unknown>>(
    `SELECT serial_number AS "serialNumber",
            location,
            type,
            size,
            installation_date AS "installationDate",
            expiry_date AS "expiryDate",
            status,
            created_at AS "createdAt"
       FROM extinguishers
      ORDER BY created_at DESC`
  );

  return result.rows;
}
