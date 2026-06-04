import { Request, Response } from 'express';
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword
} from '../services/auth.service';
import { asyncHandler } from '../../../utils/async-handler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  // Public signups are for ordinary users; staff roles must be created by an Admin.
  const result = await registerUser({ ...req.body, role: 'User' });
  res.status(201).json({ message: 'User registered successfully.', data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  res.status(200).json({ message: 'Login successful.', data: result });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Logout successful. Discard the current token on the client.' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await requestPasswordReset(req.body.email);
  res.status(200).json({ message: result.message, data: result });
});

export const resetPasswordController = asyncHandler(async (req: Request, res: Response) => {
  const result = await resetPassword(req.body.email, req.body.token, req.body.password);
  res.status(200).json(result);
});
