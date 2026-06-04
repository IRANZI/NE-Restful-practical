import bcrypt from 'bcryptjs';
import { UserRole } from '../../../config/constants';
import { createHttpError } from '../../../utils/http-error';
import { query } from '../db/client';

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
}

interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

function selectUserSql(whereClause = '') {
  return `SELECT id,
                 first_name AS "firstName",
                 last_name AS "lastName",
                 email,
                 role,
                 created_at AS "createdAt",
                 updated_at AS "updatedAt"
            FROM users
           ${whereClause}`;
}

export async function getProfile(userId: string) {
  const result = await query<UserRow>(selectUserSql('WHERE id = $1'), [userId]);
  const user = result.rows[0];

  if (!user) {
    throw createHttpError('User profile was not found.', 404);
  }

  return user;
}

export async function listUsers(filters: { role?: UserRole } = {}) {
  const values: unknown[] = [];
  const whereClause = filters.role ? 'WHERE role = $1' : '';

  if (filters.role) {
    values.push(filters.role);
  }

  const result = await query<UserRow>(`${selectUserSql(whereClause)} ORDER BY created_at DESC`, values);
  return result.rows;
}

export async function createUser(input: CreateUserInput) {
  // Admin-created accounts can include staff roles, but the password is still hashed before storage.
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const result = await query<UserRow>(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id,
                 first_name AS "firstName",
                 last_name AS "lastName",
                 email,
                 role,
                 created_at AS "createdAt",
                 updated_at AS "updatedAt"`,
      [input.firstName, input.lastName, input.email, passwordHash, input.role]
    );

    return result.rows[0];
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      throw createHttpError('A user with this email already exists.', 409);
    }

    throw error;
  }
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const columnMap: Record<keyof UpdateUserInput, string> = {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    role: 'role'
  };

  const assignments: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(input) as [keyof UpdateUserInput, unknown][]) {
    if (value !== undefined) {
      values.push(value);
      assignments.push(`${columnMap[key]} = $${values.length}`);
    }
  }

  if (assignments.length === 0) {
    return getProfile(userId);
  }

  values.push(userId);

  try {
    const result = await query<UserRow>(
      `UPDATE users
          SET ${assignments.join(', ')},
              updated_at = NOW()
        WHERE id = $${values.length}
        RETURNING id,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  role,
                  created_at AS "createdAt",
                  updated_at AS "updatedAt"`,
      values
    );

    if (!result.rows[0]) {
      throw createHttpError('User profile was not found.', 404);
    }

    return result.rows[0];
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      throw createHttpError('A user with this email already exists.', 409);
    }

    throw error;
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const result = await query<UserRow>(
    `SELECT id, password_hash AS "passwordHash"
       FROM users
      WHERE id = $1`,
    [userId]
  );
  const user = result.rows[0];

  if (!user?.passwordHash) {
    throw createHttpError('User profile was not found.', 404);
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!matches) {
    throw createHttpError('Current password is incorrect.', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await query(
    `UPDATE users
        SET password_hash = $1,
            updated_at = NOW()
      WHERE id = $2`,
    [passwordHash, userId]
  );

  return { message: 'Password changed successfully.' };
}

export async function deleteUser(userId: string) {
  const result = await query('DELETE FROM users WHERE id = $1', [userId]);

  if (result.rowCount === 0) {
    throw createHttpError('User profile was not found.', 404);
  }
}
