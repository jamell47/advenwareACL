"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganisationRequestController = void 0;
const organisationRequest_service_1 = require("../services/organisationRequest.service");
class OrganisationRequestController {
    static async createRequest(req, res, next) {
        try {
            const request = await organisationRequest_service_1.OrganisationRequestService.createRequest(req.organisation.id, req.body);
            res.status(201).json({
                success: true,
                message: "Request submitted successfully",
                data: request,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRequests(req, res, next) {
        try {
            const result = await organisationRequest_service_1.OrganisationRequestService.getRequests(req.organisation.id, {
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                status: req.query.status,
                requestType: req.query.requestType,
                search: req.query.search,
            });
            res.status(200).json({
                success: true,
                message: "Requests retrieved successfully",
                data: result.data,
                meta: result.meta,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRequestById(req, res, next) {
        try {
            const request = await organisationRequest_service_1.OrganisationRequestService.getRequestById(req.organisation.id, req.params.id);
            res.status(200).json({
                success: true,
                message: "Request retrieved successfully",
                data: request,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRequest(req, res, next) {
        try {
            const request = await organisationRequest_service_1.OrganisationRequestService.updateRequest(req.organisation.id, req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: "Request updated successfully",
                data: request,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async cancelRequest(req, res, next) {
        try {
            const request = await organisationRequest_service_1.OrganisationRequestService.cancelRequest(req.organisation.id, req.params.id);
            res.status(200).json({
                success: true,
                message: "Request cancelled successfully",
                data: request,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRequestStats(req, res, next) {
        try {
            const stats = await organisationRequest_service_1.OrganisationRequestService.getRequestStats(req.organisation.id);
            res.status(200).json({
                success: true,
                message: "Request statistics retrieved successfully",
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OrganisationRequestController = OrganisationRequestController;
//# sourceMappingURL=organisationRequest.controller.js.map