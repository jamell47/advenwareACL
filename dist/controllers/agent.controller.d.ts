import { Request, Response, NextFunction } from "express";
export declare class AgentController {
    static getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAgents(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAgentById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static approveAgent(req: Request, res: Response, next: NextFunction): Promise<void>;
    static suspendAgent(req: Request, res: Response, next: NextFunction): Promise<void>;
    static activateAgent(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getMyStudents(req: Request, res: Response, next: NextFunction): Promise<void>;
    static registerStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getMyCommissions(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getMyWithdrawals(req: Request, res: Response, next: NextFunction): Promise<void>;
    static requestWithdrawal(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getMyStudentsForAgent(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=agent.controller.d.ts.map