import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../config/constants';
import { env } from '../config/env';
import { createHttpError } from '../utils/http-error';

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export function authenticateServiceToken(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return next(createHttpError('Authentication token is required.', 401));
  }

  try {
    const token = authorization.replace('Bearer ', '').trim();
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;

    req.currentUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName ?? '',
      lastName: payload.lastName ?? ''
    };

    return next();
  } catch (_error) {
    return next(createHttpError('Invalid or expired authentication token.', 401));
  }
}

export function authorizeServiceRoles(...roles: UserRole[]): RequestHandler {
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
