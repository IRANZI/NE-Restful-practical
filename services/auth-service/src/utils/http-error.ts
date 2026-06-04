export interface PublicValidationError {
  field?: string;
  message: string;
}

export class HttpError extends Error {
  statusCode: number;
  errors?: PublicValidationError[];

  constructor(message: string, statusCode = 500, errors?: PublicValidationError[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function createHttpError(
  message: string,
  statusCode = 500,
  errors?: PublicValidationError[]
) {
  return new HttpError(message, statusCode, errors);
}
