"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePlacementSchema = exports.CreatePlacementSchema = void 0;
const zod_1 = require("zod");
exports.CreatePlacementSchema = zod_1.z.object({
    organizationName: zod_1.z.string().min(2, "Organization name is required"),
    department: zod_1.z.string().optional(),
    positionTitle: zod_1.z.string().min(2, "Position title is required"),
    location: zod_1.z.string().min(2, "Location is required"),
    supervisorName: zod_1.z.string().optional(),
    supervisorPhone: zod_1.z.string().optional(),
    supervisorEmail: zod_1.z.string().email("Invalid email").optional(),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date(),
    placementFee: zod_1.z.number().min(1).optional(),
});
exports.UpdatePlacementSchema = zod_1.z.object({
    status: zod_1.z.enum(["SEARCHING", "MATCHED", "CONFIRMED", "REJECTED", "CANCELLED"]).optional(),
    organizationName: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    positionTitle: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    supervisorName: zod_1.z.string().optional(),
    supervisorPhone: zod_1.z.string().optional(),
    supervisorEmail: zod_1.z.string().email("Invalid email").optional(),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
});
//# sourceMappingURL=placement.schema.js.map