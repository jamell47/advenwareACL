import { Request, Response, NextFunction } from "express";
export declare class CommissionController {
    static getAllCommissions(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getCommissionById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static approveCommission(req: Request, res: Response, next: NextFunction): Promise<void>;
    static markEligible(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=commission.controller.d.ts.map