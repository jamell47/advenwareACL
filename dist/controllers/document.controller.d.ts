import { Request, Response, NextFunction } from "express";
export declare class DocumentController {
    static getAllDocuments(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getDocumentById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
    static uploadNewVersion(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
    static downloadDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getDocumentStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAdminDocuments(req: Request, res: Response, next: NextFunction): Promise<void>;
    static approveDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
    static rejectDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
    static requestReupload(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=document.controller.d.ts.map