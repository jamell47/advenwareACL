import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { APIError } from "./errorHandler";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = { body: req.body, params: req.params, query: req.query };
      const parsed = schema.safeParse(input);

      if (parsed.success && Object.keys(parsed.data).length > 0) {
        if (parsed.data.body !== undefined) req.body = parsed.data.body;
        if (parsed.data.params !== undefined) req.params = parsed.data.params;
        if (parsed.data.query !== undefined) req.query = parsed.data.query;
        return next();
      }

      const bodyParsed = schema.safeParse(req.body);
      if (bodyParsed.success) {
        req.body = bodyParsed.data;
        return next();
      }

      const queryParsed = schema.safeParse(req.query);
      if (queryParsed.success) {
        req.query = queryParsed.data;
        return next();
      }

      const message = parsed.error!.errors.map((e: any) => e.message).join(", ");
      next(new APIError(message, 400, "VALIDATION_ERROR"));
    } catch (error) {
      next(error);
    }
  };
};
