import { Request, Response } from 'express';
import {
  exportInventoryCsv,
  exportMaintenanceCsv,
  getReportSummary
} from '../services/reports.service';
import { asyncHandler } from '../../../utils/async-handler';

export const getSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await getReportSummary();
  res.status(200).json({ message: 'Report summary generated successfully.', data: summary });
});

export const downloadInventoryCsv = asyncHandler(async (_req: Request, res: Response) => {
  const csv = await exportInventoryCsv();
  res.header('Content-Type', 'text/csv');
  res.attachment('inventory-report.csv');
  res.status(200).send(csv);
});

export const downloadMaintenanceCsv = asyncHandler(async (_req: Request, res: Response) => {
  const csv = await exportMaintenanceCsv();
  res.header('Content-Type', 'text/csv');
  res.attachment('maintenance-report.csv');
  res.status(200).send(csv);
});
