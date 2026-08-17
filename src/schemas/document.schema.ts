import { z } from "zod";
import { DocumentType, DocumentStatus } from "@prisma/client";

export const UploadDocumentSchema = z.object({
  type: z.nativeEnum(DocumentType),
  customTypeName: z.string().max(200).optional(),
  isRequired: z.boolean().optional(),
});

export const DocumentQueryParamsSchema = z.object({
  type: z.nativeEnum(DocumentType).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
