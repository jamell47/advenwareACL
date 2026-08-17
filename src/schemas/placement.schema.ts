import { z } from "zod";

export const CreatePlacementSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  department: z.string().optional(),
  positionTitle: z.string().min(2, "Position title is required"),
  location: z.string().min(2, "Location is required"),
  supervisorName: z.string().optional(),
  supervisorPhone: z.string().optional(),
  supervisorEmail: z.string().email("Invalid email").optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  placementFee: z.number().min(1).optional(),
});

export const UpdatePlacementSchema = z.object({
  status: z.enum(["SEARCHING", "MATCHED", "CONFIRMED", "REJECTED", "CANCELLED"]).optional(),
  organizationName: z.string().optional(),
  department: z.string().optional(),
  positionTitle: z.string().optional(),
  location: z.string().optional(),
  supervisorName: z.string().optional(),
  supervisorPhone: z.string().optional(),
  supervisorEmail: z.string().email("Invalid email").optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
