import { Request, Response, NextFunction } from "express";
export declare class ReportController {
    static studentRegistrations(req: Request, res: Response, next: NextFunction): Promise<void>;
    static agentPerformance(req: Request, res: Response, next: NextFunction): Promise<void>;
    static placements(req: Request, res: Response, next: NextFunction): Promise<void>;
    static payments(req: Request, res: Response, next: NextFunction): Promise<void>;
    static commissions(req: Request, res: Response, next: NextFunction): Promise<void>;
    static withdrawals(req: Request, res: Response, next: NextFunction): Promise<void>;
    static documents(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=report.controller.d.ts.map