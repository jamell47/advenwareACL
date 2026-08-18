"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const student_service_1 = require("../services/student.service");
class StudentController {
    static async getMyProfile(req, res, next) {
        try {
            const profile = await student_service_1.StudentService.getMyProfile(req.user.id);
            res.status(200).json({
                success: true,
                message: "Profile retrieved successfully",
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMyProfile(req, res, next) {
        try {
            const profile = await student_service_1.StudentService.updateMyProfile(req.user.id, req.body);
            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.StudentController = StudentController;
//# sourceMappingURL=student.controller.js.map