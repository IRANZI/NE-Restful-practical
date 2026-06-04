import { Router } from 'express';
import {
  downloadInventoryCsv,
  downloadMaintenanceCsv,
  getSummary
} from '../controllers/reports.controller';
import {
  authenticateServiceToken,
  authorizeServiceRoles
} from '../../../shared/jwt-auth.middleware';

const router = Router();

router.use('/api/reports', authenticateServiceToken);
router.get('/api/reports/summary', getSummary);
router.get('/api/reports/inventory.csv', authorizeServiceRoles('Admin', 'Inspector'), downloadInventoryCsv);
router.get('/api/reports/maintenance.csv', authorizeServiceRoles('Admin', 'Inspector'), downloadMaintenanceCsv);

export default router;
