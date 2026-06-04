import { z } from 'zod';
import { USER_ROLES } from '../config/constants';

// Public registration is intentionally user-only so nobody can self-register as Admin or Inspector.
export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(120)
});

// Admins use this schema when they intentionally create staff or admin accounts.
export const adminCreateUserSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(120),
  role: z.enum(USER_ROLES).default('User')
});

export const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase())
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  token: z.string().min(20),
  password: z.string().min(8).max(120)
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(80).optional(),
  lastName: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()).optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(120)
});

export const adminUpdateUserSchema = z.object({
  firstName: z.string().trim().min(2).max(80).optional(),
  lastName: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()).optional(),
  role: z.enum(USER_ROLES).optional()
});
