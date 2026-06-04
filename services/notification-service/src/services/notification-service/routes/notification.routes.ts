import { Router } from 'express';
import {
  getNotifications,
  sendEmailController
} from '../controllers/notification.controller';
import { validateBody } from '../../../middleware/validation.middleware';
import {
  authenticateServiceToken,
  authorizeServiceRoles
} from '../../../shared/jwt-auth.middleware';
import { sendEmailSchema } from '../validators/notification.schemas';

const router = Router();

router.post('/api/notifications/email', validateBody(sendEmailSchema), sendEmailController);
router.get(
  '/api/notifications',
  authenticateServiceToken,
  authorizeServiceRoles('Admin'),
  getNotifications
);

export default router;
