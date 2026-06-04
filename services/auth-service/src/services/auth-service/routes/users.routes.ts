import { Router } from 'express';
import {
  changeMyPassword,
  createUserByAdmin,
  deleteUserById,
  getMe,
  getUsers,
  updateMe,
  updateUserById
} from '../controllers/users.controller';
import {
  authenticateServiceToken,
  authorizeServiceRoles
} from '../../../shared/jwt-auth.middleware';
import { validateBody } from '../../../middleware/validation.middleware';
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  changePasswordSchema,
  updateProfileSchema
} from '../../../validators/auth.schemas';

const router = Router();

router.use(authenticateServiceToken);
router.get('/me', getMe);
router.patch('/me', validateBody(updateProfileSchema), updateMe);
router.patch('/me/password', validateBody(changePasswordSchema), changeMyPassword);
router.get('/', authorizeServiceRoles('Admin'), getUsers);
router.post('/', authorizeServiceRoles('Admin'), validateBody(adminCreateUserSchema), createUserByAdmin);
router.patch('/:id', authorizeServiceRoles('Admin'), validateBody(adminUpdateUserSchema), updateUserById);
router.delete('/:id', authorizeServiceRoles('Admin'), deleteUserById);

export default router;
