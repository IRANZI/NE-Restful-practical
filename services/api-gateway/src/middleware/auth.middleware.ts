import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { env } from '../config/env';
import { UserRole } from '../config/constants';
import { createHttpError } from '../utils/http-error';

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return next(createHttpError('Authentication token is required.', 401));
  }

  try {
    const token = authorization.replace('Bearer ', '').trim();
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    const result = await query<UserRow>(
      `SELECT id,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              role
         FROM users
        WHERE id = $1`,
      [payload.sub]
    );

    const user = result.rows[0];

    if (!user) {
      return next(createHttpError('Authenticated user was not found.', 401));
    }

    req.currentUser = user;
    return next();
  } catch (_error) {
    return next(createHttpError('Invalid or expired authentication token.', 401));
  }
}

export function authorize(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.currentUser) {
      return next(createHttpError('Authentication token is required.', 401));
    }

    if (!roles.includes(req.currentUser.role)) {
      return next(createHttpError('You do not have permission to perform this action.', 403));
    }

    return next();
  };
}
