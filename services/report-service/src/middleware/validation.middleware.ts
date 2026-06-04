import { RequestHandler } from 'express';
import { AnyZodObject, ZodError, ZodSchema } from 'zod';
import { createHttpError } from '../utils/http-error';

function toPublicErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message
  }));
}

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(createHttpError('Validation failed.', 400, toPublicErrors(result.error)));
    }

    req.body = result.data;
    return next();
  };
}

export function validateQuery(schema: AnyZodObject): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return next(createHttpError('Validation failed.', 400, toPublicErrors(result.error)));
    }

    req.query = result.data;
    return next();
  };
}
