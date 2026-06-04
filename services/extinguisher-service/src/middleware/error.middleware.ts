import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http-error';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} was not found.`
  });
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      errors: error.errors
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    message: 'Internal server error.'
  });
}
