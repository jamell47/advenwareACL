import { Request, Response, NextFunction } from "express";
export declare class PlacementController {
    static getMyPlacement(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAllPlacements(req: Request, res: Response, next: NextFunction): Promise<void>;
    static confirmPlacement(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAdminPlacements(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAdminPlacementById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createPlacement(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updatePlacement(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=placement.controller.d.ts.map