"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganisationAdminController = void 0;
const organisation_service_1 = require("../services/organisation.service");
const organisationRequest_service_1 = require("../services/organisationRequest.service");
const query_util_1 = require("../utils/query.util");
class OrganisationAdminController {
    static async getOrganisations(req, res, next) {
        try {
            const cleanParams = (0, query_util_1.sanitizeQueryParams)(req.query);
            const result = await organisation_service_1.OrganisationService.getOrganisations({
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                search: cleanParams.search,
                status: cleanParams.status,
            });
            res.status(200).json({
                success: true,
                message: "Organisations retrieved",
                data: result.data,
                meta: result.meta,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getOrganisation(req, res, next) {
        try {
            const result = await organisation_service_1.OrganisationService.getOrganisationById(req.params.id);
            res.status(200).json({
                success: true,
                message: "Organisation retrieved",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllRequests(req, res, next) {
        try {
            const cleanParams = (0, query_util_1.sanitizeQueryParams)(req.query);
            const result = await organisationRequest_service_1.OrganisationRequestService.getAllRequests({
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                status: cleanParams.status,
                requestType: cleanParams.requestType,
                search: cleanParams.search,
            });
            res.status(200).json({
                success: true,
                message: "Organisation requests retrieved",
                data: result.data,
                meta: result.meta,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRequest(req, res, next) {
        try {
            const request = await organisationRequest_service_1.OrganisationRequestService.getRequestByIdAdmin(req.params.id);
            res.status(200).json({
                success: true,
                message: "Organisation request retrieved",
                data: request,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRequestStatus(req, res, next) {
        try {
            const request = await organisationRequest_service_1.OrganisationRequestService.updateRequestStatus(req.params.id, req.body.status, req.body.notes);
            res.status(200).json({
                success: true,
                message: "Request status updated",
                data: request,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getOrganisationStats(req, res, next) {
        try {
            const requestCount = await organisationRequest_service_1.OrganisationRequestService.countByOrganisation(req.params.id);
            res.status(200).json({
                success: true,
                message: "Organisation statistics retrieved",
                data: { requestCount },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OrganisationAdminController = OrganisationAdminController;
//# sourceMappingURL=organisationAdmin.controller.js.map