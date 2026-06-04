import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '../../../config/constants';
import { env } from '../../../config/env';
import { createHttpError } from '../../../utils/http-error';
import { query } from '../db/client';
import { requestNotification } from './notification-client';

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

function sanitizeUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function signToken(user: PublicUser) {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn']
  };

  return jwt.sign(
    {
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    },
    env.jwtSecret,
    {
      ...options,
      subject: user.id
    }
  );
}
// Find a user by email address, used for login and password reset flows
export async function findUserByEmail(email: string) {
  const result = await query<UserRow>(
    `SELECT id,
            first_name AS "firstName",
            last_name AS "lastName",
            email,
            password_hash AS "passwordHash",
            role,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
       FROM users
      WHERE email = $1`,
    [email]
  );

  return result.rows[0];
}
// Register a new user with the provided details, ensuring the email is unique and hashing the password before storing
export async function registerUser(input: RegisterInput) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw createHttpError('A user with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const result = await query<UserRow>(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id,
               first_name AS "firstName",
               last_name AS "lastName",
               email,
               password_hash AS "passwordHash",
               role,
               created_at AS "createdAt",
               updated_at AS "updatedAt"`,
    [input.firstName, input.lastName, input.email, passwordHash, input.role]
  );

  const user = sanitizeUser(result.rows[0]);

  return {
    user,
    token: signToken(user)
  };
}
// Authenticate a user by verifying the provided email and password, returning a JWT token if successful
export async function loginUser(input: { email: string; password: string }) {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw createHttpError('Invalid email or password.', 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw createHttpError('Invalid email or password.', 401);
  }

  const publicUser = sanitizeUser(user);

  return {
    user: publicUser,
    token: signToken(publicUser)
  };
}
// Hash a password reset token using SHA-256 to securely store it in the database and compare during reset
function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function requestPasswordReset(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    return { message: 'If the email exists, reset instructions have been sent.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await query(
    `UPDATE users
        SET reset_token_hash = $1,
            reset_token_expires_at = $2,
            updated_at = NOW()
      WHERE id = $3`,
    [tokenHash, expiresAt, user.id]
  );

  const resetUrl = `${env.passwordResetUrl}?email=${encodeURIComponent(email)}&token=${token}`;

  await requestNotification(
    email,
    'TZW LTD password reset',
    `Use this password reset link within 1 hour: ${resetUrl}`
  );

  return {
    message: 'If the email exists, reset instructions have been sent.',
    resetToken: env.nodeEnv === 'production' ? undefined : token
  };
}
// Reset a user's password by validating the reset token and updating the password hash in the database
export async function resetPassword(email: string, token: string, password: string) {
  const tokenHash = hashResetToken(token);
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query(
    `UPDATE users
        SET password_hash = $1,
            reset_token_hash = NULL,
            reset_token_expires_at = NULL,
            updated_at = NOW()
      WHERE email = $2
        AND reset_token_hash = $3
        AND reset_token_expires_at > NOW()`,
    [passwordHash, email, tokenHash]
  );

  if (result.rowCount === 0) {
    throw createHttpError('Reset token is invalid or expired.', 400);
  }

  return { message: 'Password reset successfully.' };
}
