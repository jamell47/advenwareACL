import { Request, Response, NextFunction } from "express";
export declare class PaymentController {
    static getMyPayments(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPaymentById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAdminPayments(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAdminPaymentById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    static initiateSTKPush(req: Request, res: Response, next: NextFunction): Promise<void>;
    static handleCallback(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=payment.controller.d.ts.map