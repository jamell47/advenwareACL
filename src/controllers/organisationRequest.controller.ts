import { Response, NextFunction } from "express";
import { OrganisationRequestService } from "../services/organisationRequest.service";
import { AuthenticatedOrganisationRequest } from "../middleware/organisationAuth";

export class OrganisationRequestController {
  static async createRequest(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction) {
    try {
      const request = await OrganisationRequestService.createRequest(req.organisation!.id, req.body);
      res.status(201).json({
        success: true,
        message: "Request submitted successfully",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRequests(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrganisationRequestService.getRequests(req.organisation!.id, {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        status: req.query.status as string | undefined,
        requestType: req.query.requestType as string | undefined,
        search: req.query.search as string | undefined,
      });
      res.status(200).json({
        success: true,
        message: "Requests retrieved successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRequestById(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction) {
    try {
      const request = await OrganisationRequestService.getRequestById(req.organisation!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: "Request retrieved successfully",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRequest(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction) {
    try {
      const request = await OrganisationRequestService.updateRequest(req.organisation!.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: "Request updated successfully",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelRequest(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction) {
    try {
      const request = await OrganisationRequestService.cancelRequest(req.organisation!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: "Request cancelled successfully",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRequestStats(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction) {
    try {
      const stats = await OrganisationRequestService.getRequestStats(req.organisation!.id);
      res.status(200).json({
        success: true,
        message: "Request statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
