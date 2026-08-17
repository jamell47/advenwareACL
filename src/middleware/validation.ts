import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { APIError } from "./errorHandler";

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      req.body = parsed.body;
      req.params = parsed.params;
      req.query = parsed.query;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((e) => e.message).join(", ");
        return next(new APIError(message, 400, "VALIDATION_ERROR"));
      }
      next(error);
    }
  };
};
