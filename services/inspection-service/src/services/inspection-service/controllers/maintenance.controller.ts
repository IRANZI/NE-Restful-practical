import { Request, Response } from 'express';
import {
  createMaintenanceLog,
  exportMaintenanceRows,
  getMaintenanceById,
  getRecentMaintenance,
  listMaintenance
} from '../services/maintenance.service';
import { asyncHandler } from '../../../utils/async-handler';

export const getMaintenanceLogs = asyncHandler(async (req: Request, res: Response) => {
  const logs = await listMaintenance({
    extinguisherId: req.query.extinguisherId as string | undefined,
    inspectorId: req.query.inspectorId as string | undefined
  });
  res.status(200).json({ message: 'Maintenance logs retrieved successfully.', data: logs });
});

export const getMaintenanceLog = asyncHandler(async (req: Request, res: Response) => {
  const log = await getMaintenanceById(req.params.id);
  res.status(200).json({ message: 'Maintenance log retrieved successfully.', data: log });
});

export const createMaintenanceLogController = asyncHandler(async (req: Request, res: Response) => {
  const log = await createMaintenanceLog(req.body);
  res.status(201).json({ message: 'Maintenance activity logged successfully.', data: log });
});

export const getInternalRecentMaintenance = asyncHandler(async (_req: Request, res: Response) => {
  const logs = await getRecentMaintenance();
  res.status(200).json({ data: logs });
});

export const getInternalMaintenanceRows = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await exportMaintenanceRows();
  res.status(200).json({ data: rows });
});
