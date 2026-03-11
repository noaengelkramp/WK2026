import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodObject, ZodRawShape } from 'zod';
import { AppError } from './errorHandler';

type AnyZodObject = ZodObject<ZodRawShape>;

/**
 * Middleware to validate request body against a Zod schema
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate body and strip any extra fields not defined in schema
      const validatedData = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;

      // Replace original data with validated/stripped data
      // Using type casting to avoid TS2322 while keeping the original properties updated
      req.body = validatedData.body;
      req.query = validatedData.query as any;
      req.params = validatedData.params as any;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => {
          const path = issue.path.join('.');
          return `${path}: ${issue.message}`;
        });
        
        next(new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400));
      } else {
        next(error);
      }
    }
  };
};
