import { Request, Response, NextFunction } from "express";
import { OrganisationService } from "../services/organisation.service";
import { OrganisationRequestService } from "../services/organisationRequest.service";
import { sanitizeQueryParams } from "../utils/query.util";

export class OrganisationAdminController {
  static async getOrganisations(req: Request, res: Response, next: NextFunction) {
    try {
      const cleanParams = sanitizeQueryParams(req.query);
      const result = await OrganisationService.getOrganisations({
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: cleanParams.search as string | undefined,
        status: cleanParams.status as string | undefined,
      });
      res.status(200).json({
        success: true,
        message: "Organisations retrieved",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrganisation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrganisationService.getOrganisationById(req.params.id);
      res.status(200).json({
        success: true,
        message: "Organisation retrieved",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const cleanParams = sanitizeQueryParams(req.query);
      const result = await OrganisationRequestService.getAllRequests({
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        status: cleanParams.status as string | undefined,
        requestType: cleanParams.requestType as string | undefined,
        search: cleanParams.search as string | undefined,
      });
      res.status(200).json({
        success: true,
        message: "Organisation requests retrieved",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await OrganisationRequestService.getRequestByIdAdmin(req.params.id);
      res.status(200).json({
        success: true,
        message: "Organisation request retrieved",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await OrganisationRequestService.updateRequestStatus(
        req.params.id,
        req.body.status,
        req.body.notes,
      );
      res.status(200).json({
        success: true,
        message: "Request status updated",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrganisationStats(req: Request, res: Response, next: NextFunction) {
    try {
      const requestCount = await OrganisationRequestService.countByOrganisation(req.params.id);
      res.status(200).json({
        success: true,
        message: "Organisation statistics retrieved",
        data: { requestCount },
      });
    } catch (error) {
      next(error);
    }
  }
}
