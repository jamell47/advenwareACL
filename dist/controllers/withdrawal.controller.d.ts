import { Request, Response, NextFunction } from "express";
export declare class WithdrawalController {
    static getAllWithdrawals(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getWithdrawalById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static approveWithdrawal(req: Request, res: Response, next: NextFunction): Promise<void>;
    static rejectWithdrawal(req: Request, res: Response, next: NextFunction): Promise<void>;
    static processB2C(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=withdrawal.controller.d.ts.map