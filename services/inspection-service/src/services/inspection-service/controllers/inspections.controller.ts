import { Request, Response } from 'express';
import {
  completeInspection,
  getInspectionById,
  getInspectionSummary,
  listInspections,
  scheduleInspection,
  updateInspection
} from '../services/inspections.service';
import { asyncHandler } from '../../../utils/async-handler';
import { createHttpError } from '../../../utils/http-error';

function currentUserId(req: Request) {
  if (!req.currentUser) {
    throw createHttpError('Authentication token is required.', 401);
  }

  return req.currentUser.id;
}

export const getInspections = asyncHandler(async (req: Request, res: Response) => {
  const inspections = await listInspections({
    status: req.query.status as string | undefined,
    extinguisherId: req.query.extinguisherId as string | undefined,
    inspectorId: req.query.inspectorId as string | undefined
  });
  res.status(200).json({ message: 'Inspections retrieved successfully.', data: inspections });
});

export const getInspection = asyncHandler(async (req: Request, res: Response) => {
  const inspection = await getInspectionById(req.params.id);
  res.status(200).json({ message: 'Inspection retrieved successfully.', data: inspection });
});

export const scheduleInspectionController = asyncHandler(async (req: Request, res: Response) => {
  const inspection = await scheduleInspection(req.body, currentUserId(req));
  res.status(201).json({ message: 'Inspection scheduled successfully.', data: inspection });
});

export const updateInspectionController = asyncHandler(async (req: Request, res: Response) => {
  const inspection = await updateInspection(req.params.id, req.body);
  res.status(200).json({ message: 'Inspection updated successfully.', data: inspection });
});

export const completeInspectionController = asyncHandler(async (req: Request, res: Response) => {
  const inspection = await completeInspection(req.params.id, req.body.result, req.body.notes);
  res.status(200).json({ message: 'Inspection completed successfully.', data: inspection });
});

export const getInternalInspectionSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await getInspectionSummary();
  res.status(200).json({ data: summary });
});
