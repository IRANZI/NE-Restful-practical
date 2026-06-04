import { Router } from 'express';
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPasswordController
} from '../controllers/auth.controller';
import { authenticateServiceToken } from '../../../shared/jwt-auth.middleware';
import { validateBody } from '../../../middleware/validation.middleware';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema
} from '../../../validators/auth.schemas';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', authenticateServiceToken, logout);
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPasswordController);

export default router;
