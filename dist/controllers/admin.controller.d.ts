import { Request, Response, NextFunction } from "express";
export declare class AdminController {
    static getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getStudents(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getStudentById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
    static suspendStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
    static activateStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAdmins(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    static disableAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getRoles(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getSystemSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateSystemSetting(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=admin.controller.d.ts.map