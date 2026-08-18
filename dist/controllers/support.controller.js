"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportController = void 0;
const support_service_1 = require("../services/support.service");
class SupportController {
    static async getSupportInfo(req, res, next) {
        try {
            const info = await support_service_1.SupportService.getSupportInfo();
            res.status(200).json({
                success: true,
                message: "Support information retrieved successfully",
                data: info,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateSupportConfig(req, res, next) {
        try {
            const config = await support_service_1.SupportService.updateSupportConfig(req.body);
            res.status(200).json({
                success: true,
                message: "Support configuration updated successfully",
                data: config,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SupportController = SupportController;
//# sourceMappingURL=support.controller.js.map