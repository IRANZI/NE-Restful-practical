import { Router } from 'express';
import {
  createExtinguisherController,
  deleteExtinguisherController,
  getExtinguisher,
  getExtinguishers,
  getInternalInventoryRows,
  getInternalInventorySummary,
  updateExtinguisherController
} from '../controllers/extinguishers.controller';
import {
  authenticateServiceToken,
  authorizeServiceRoles
} from '../../../shared/jwt-auth.middleware';
import { validateBody, validateQuery } from '../../../middleware/validation.middleware';
import {
  createExtinguisherSchema,
  extinguisherQuerySchema,
  updateExtinguisherSchema
} from '../../../validators/extinguisher.schemas';

const router = Router();

router.get('/internal/extinguishers/:id', getExtinguisher);
router.get('/internal/reports/inventory-summary', getInternalInventorySummary);
router.get('/internal/reports/inventory-rows', getInternalInventoryRows);

router.use('/api/extinguishers', authenticateServiceToken);
router.get('/api/extinguishers', validateQuery(extinguisherQuerySchema), getExtinguishers);
router.post(
  '/api/extinguishers',
  authorizeServiceRoles('Admin', 'Inspector'),
  validateBody(createExtinguisherSchema),
  createExtinguisherController
);
router.get('/api/extinguishers/:id', getExtinguisher);
router.patch(
  '/api/extinguishers/:id',
  authorizeServiceRoles('Admin', 'Inspector'),
  validateBody(updateExtinguisherSchema),
  updateExtinguisherController
);
router.delete('/api/extinguishers/:id', authorizeServiceRoles('Admin'), deleteExtinguisherController);

export default router;
