"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacementController = void 0;
const placement_service_1 = require("../services/placement.service");
const auditLog_service_1 = require("../services/auditLog.service");
const errorHandler_1 = require("../middleware/errorHandler");
const query_util_1 = require("../utils/query.util");
class PlacementController {
    static async getMyPlacement(req, res, next) {
        try {
            const placement = await placement_service_1.PlacementService.getMyPlacement(req.user.id);
            res.status(200).json({
                success: true,
                message: "Placement retrieved successfully",
                data: placement,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllPlacements(req, res, next) {
        try {
            const placements = await placement_service_1.PlacementService.getAllPlacements(req.user.id);
            res.status(200).json({
                success: true,
                message: "Placements retrieved successfully",
                data: placements,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async confirmPlacement(req, res, next) {
        try {
            const placement = await placement_service_1.PlacementService.confirmPlacement(req.user.id, req.params.id);
            await auditLog_service_1.AuditLogService.log("PLACEMENT_CONFIRMED", req.user.id, "Placement", req.params.id, "Placement confirmed by student");
            res.status(200).json({
                success: true,
                message: "Placement confirmed successfully",
                data: placement,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAdminPlacements(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const cleanParams = (0, query_util_1.sanitizeQueryParams)(req.query);
            const status = cleanParams.status;
            const search = cleanParams.search;
            const result = await placement_service_1.PlacementService.getAdminPlacements({ page, limit, status, search });
            res.status(200).json({
                success: true,
                message: "Placements retrieved successfully",
                data: result.data,
                meta: result.meta,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAdminPlacementById(req, res, next) {
        try {
            const placement = await placement_service_1.PlacementService.getAdminPlacementById(req.params.id);
            if (!placement) {
                return next(new errorHandler_1.APIError("Placement not found", 404, "NOT_FOUND"));
            }
            res.status(200).json({
                success: true,
                message: "Placement retrieved successfully",
                data: placement,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createPlacement(req, res, next) {
        try {
            const placement = await placement_service_1.PlacementService.adminCreatePlacement(req.body);
            await auditLog_service_1.AuditLogService.log("PLACEMENT_CREATED", req.user.id, "Placement", placement.id, `Placement created for student ${req.body.userId}`);
            res.status(201).json({
                success: true,
                message: "Placement created successfully",
                data: placement,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePlacement(req, res, next) {
        try {
            const placement = await placement_service_1.PlacementService.adminUpdatePlacement(req.params.id, req.body);
            await auditLog_service_1.AuditLogService.log("PLACEMENT_UPDATED", req.user.id, "Placement", req.params.id, `Placement updated`);
            res.status(200).json({
                success: true,
                message: "Placement updated successfully",
                data: placement,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PlacementController = PlacementController;
//# sourceMappingURL=placement.controller.js.map