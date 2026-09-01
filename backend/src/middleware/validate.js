import { ValidationError } from '../errors/AppError.js';

/**
 * Higher-order middleware function to validate incoming requests with a Zod schema.
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Part of the request to validate
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const issues = result.error.errors || result.error.issues || [];
      const formattedErrors = issues.map((err) => ({
        field: err.path ? err.path.join('.') : 'field',
        message: err.message,
      }));

      return next(new ValidationError('Validation failed', formattedErrors));
    }

    req[source] = result.data;
    next();
  };
};