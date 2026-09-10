import { Request, Response, NextFunction } from "express";
import { ZodType, ZodObject } from "zod";
import { APIError } from "./errorHandler";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // For multipart/form-data uploads, req.body contains the form text fields
      // and req.file contains the uploaded file. Validate req.body directly.
      const isMultipart = req.headers["content-type"]?.includes("multipart/form-data");

      if (isMultipart) {
        const bodyParsed = schema.safeParse(req.body);
        if (bodyParsed.success) {
          req.body = bodyParsed.data;
          return next();
        }
      }

      // Standard JSON/URL-encoded body validation
      const input = { body: req.body, params: req.params, query: req.query };
      const parsed = schema.safeParse(input);

      if (parsed.success && Object.keys(parsed.data).length > 0) {
        if (parsed.data.body !== undefined) req.body = parsed.data.body;
        if (parsed.data.params !== undefined) req.params = parsed.data.params;
        if (parsed.data.query !== undefined) req.query = parsed.data.query;
        return next();
      }

      // Fallback: try parsing just body
      const bodyParsed = schema.safeParse(req.body);
      if (bodyParsed.success) {
        req.body = bodyParsed.data;
        return next();
      }

      // Fallback: try parsing just query
      const queryParsed = schema.safeParse(req.query);
      if (queryParsed.success) {
        req.query = queryParsed.data;
        return next();
      }

      if (process.env.NODE_ENV !== "production") {
        console.error("VALIDATION FAILED");
        console.error("Path:", req.originalUrl);
        console.error("Headers:", JSON.stringify(req.headers));
        console.error("Body keys:", Object.keys(req.body || {}));
        console.error("Body values:", JSON.stringify(req.body));
        console.error("Files:", req.file ? "yes" : "no");
        const schemaErrors = (parsed.error && parsed.error.errors) || (bodyParsed.error && bodyParsed.error.errors) || (queryParsed.error && queryParsed.error.errors);
        console.error("Schema errors:", JSON.stringify(schemaErrors));
      }

      const errors = (parsed.error && parsed.error.errors) || (bodyParsed.error && bodyParsed.error.errors) || (queryParsed.error && queryParsed.error.errors) || [];
      const message = errors.map((e: any) => {
        const path = e.path?.length === 1 ? String(e.path[0]) : "body";
        return `${path}: ${e.message}`;
      }).join(", ");
      next(new APIError(message, 400, "VALIDATION_ERROR"));
    } catch (error) {
      next(error);
    }
  };
};
