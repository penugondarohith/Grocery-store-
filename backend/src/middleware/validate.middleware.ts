import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Validate request body, params, and query against a Zod schema.
 * Returns 422 with field-level errors on failure.
 */
export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.slice(1).join('.'), // remove 'body'/'params'/'query' prefix
          message: e.message,
        }));
        res.status(422).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors,
        });
        return;
      }
      next(err);
    }
  };
