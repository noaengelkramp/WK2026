import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler';

/**
 * Middleware to validate request body against a Zod schema
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate body and strip any extra fields not defined in schema
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace original data with validated/stripped data
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        
        next(new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400));
      } else {
        next(error);
      }
    }
  };
};
