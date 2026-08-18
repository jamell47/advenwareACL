"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacementController = void 0;
const placement_service_1 = require("../services/placement.service");
const auditLog_service_1 = require("../services/auditLog.service");
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
}
exports.PlacementController = PlacementController;
//# sourceMappingURL=placement.controller.js.map