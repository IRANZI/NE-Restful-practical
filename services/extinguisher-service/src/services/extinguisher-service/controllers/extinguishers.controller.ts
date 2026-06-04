import { Request, Response } from 'express';
import {
  createExtinguisher,
  deleteExtinguisher,
  exportInventoryRows,
  getExtinguisherById,
  getInventorySummary,
  listExtinguishers,
  updateExtinguisher
} from '../services/extinguishers.service';
import { asyncHandler } from '../../../utils/async-handler';
// Controller for handling fire extinguisher-related endpoints, 
export const getExtinguishers = asyncHandler(async (req: Request, res: Response) => {
  const extinguishers = await listExtinguishers({
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined
  });
  res.status(200).json({ message: 'Fire extinguisher records retrieved successfully.', data: extinguishers });
});

export const getExtinguisher = asyncHandler(async (req: Request, res: Response) => {
  const extinguisher = await getExtinguisherById(req.params.id);
  res.status(200).json({ message: 'Fire extinguisher retrieved successfully.', data: extinguisher });
});

export const createExtinguisherController = asyncHandler(async (req: Request, res: Response) => {
  const extinguisher = await createExtinguisher(req.body);
  res.status(201).json({ message: 'Fire extinguisher registered successfully.', data: extinguisher });
});

export const updateExtinguisherController = asyncHandler(async (req: Request, res: Response) => {
  const extinguisher = await updateExtinguisher(req.params.id, req.body);
  res.status(200).json({ message: 'Fire extinguisher updated successfully.', data: extinguisher });
});

export const deleteExtinguisherController = asyncHandler(async (req: Request, res: Response) => {
  await deleteExtinguisher(req.params.id);
  res.status(204).send();
});

export const getInternalInventorySummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await getInventorySummary();
  res.status(200).json({ data: summary });
});

export const getInternalInventoryRows = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await exportInventoryRows();
  res.status(200).json({ data: rows });
});
