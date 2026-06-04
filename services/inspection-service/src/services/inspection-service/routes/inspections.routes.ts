import { Router } from 'express';
import {
  completeInspectionController,
  getInspection,
  getInspections,
  getInternalInspectionSummary,
  scheduleInspectionController,
  updateInspectionController
} from '../controllers/inspections.controller';
import {
  createMaintenanceLogController,
  getInternalMaintenanceRows,
  getInternalRecentMaintenance,
  getMaintenanceLog,
  getMaintenanceLogs
} from '../controllers/maintenance.controller';
import {
  authenticateServiceToken,
  authorizeServiceRoles
} from '../../../shared/jwt-auth.middleware';
import { validateBody, validateQuery } from '../../../middleware/validation.middleware';
import {
  completeInspectionSchema,
  inspectionQuerySchema,
  scheduleInspectionSchema,
  updateInspectionSchema
} from '../../../validators/inspection.schemas';
import {
  createMaintenanceLogSchema,
  maintenanceQuerySchema
} from '../../../validators/maintenance.schemas';

const router = Router();

router.get('/internal/reports/inspection-summary', getInternalInspectionSummary);
router.get('/internal/reports/recent-maintenance', getInternalRecentMaintenance);
router.get('/internal/reports/maintenance-rows', getInternalMaintenanceRows);

router.use('/api', authenticateServiceToken);

router.get('/api/inspections', validateQuery(inspectionQuerySchema), getInspections);
router.post('/api/inspections', validateBody(scheduleInspectionSchema), scheduleInspectionController);
router.get('/api/inspections/:id', getInspection);
router.patch(
  '/api/inspections/:id',
  authorizeServiceRoles('Admin', 'Inspector'),
  validateBody(updateInspectionSchema),
  updateInspectionController
);
router.post(
  '/api/inspections/:id/complete',
  authorizeServiceRoles('Admin', 'Inspector'),
  validateBody(completeInspectionSchema),
  completeInspectionController
);

router.get('/api/maintenance', validateQuery(maintenanceQuerySchema), getMaintenanceLogs);
router.post(
  '/api/maintenance',
  authorizeServiceRoles('Admin', 'Inspector'),
  validateBody(createMaintenanceLogSchema),
  createMaintenanceLogController
);
router.get('/api/maintenance/:id', getMaintenanceLog);

export default router;
