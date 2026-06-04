import { Request, Response } from 'express';
import {
  changePassword,
  createUser,
  deleteUser,
  getProfile,
  listUsers,
  updateUser
} from '../services/users.service';
import { UserRole } from '../../../config/constants';
import { asyncHandler } from '../../../utils/async-handler';
import { createHttpError } from '../../../utils/http-error';
// Helper function to ensure the user is authenticated and retrieve their profile
function requireCurrentUser(req: Request) {
  if (!req.currentUser) {
    throw createHttpError('Authentication token is required.', 401);
  }

  return req.currentUser;
}

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = requireCurrentUser(req);
  const profile = await getProfile(user.id);
  res.status(200).json({ message: 'Profile retrieved successfully.', data: profile });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const user = requireCurrentUser(req);
  const profile = await updateUser(user.id, req.body);
  res.status(200).json({ message: 'Profile updated successfully.', data: profile });
});

export const changeMyPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = requireCurrentUser(req);
  const result = await changePassword(user.id, req.body.currentPassword, req.body.newPassword);
  res.status(200).json(result);
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await listUsers({ role: req.query.role as UserRole | undefined });
  res.status(200).json({ message: 'Users retrieved successfully.', data: users });
});

export const createUserByAdmin = asyncHandler(async (req: Request, res: Response) => {
  // This protected endpoint lets Admin create Inspectors or other Admins without public role signup.
  const user = await createUser(req.body);
  res.status(201).json({ message: 'User created successfully.', data: user });
});

export const updateUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateUser(req.params.id, req.body);
  res.status(200).json({ message: 'User updated successfully.', data: user });
});

export const deleteUserById = asyncHandler(async (req: Request, res: Response) => {
  await deleteUser(req.params.id);
  res.status(204).send();
});
