"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentQueryParamsSchema = exports.UploadDocumentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.UploadDocumentSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(client_1.DocumentType),
    customTypeName: zod_1.z.string().max(200).optional(),
    isRequired: zod_1.z.boolean().optional(),
});
exports.DocumentQueryParamsSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(client_1.DocumentType).optional(),
    status: zod_1.z.nativeEnum(client_1.DocumentStatus).optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
});
//# sourceMappingURL=document.schema.js.map