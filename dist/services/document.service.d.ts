import { DocumentType, DocumentStatus } from "@prisma/client";
interface UploadDocumentData {
    type: DocumentType;
    customTypeName?: string;
    isRequired?: boolean;
    applicationId?: string;
}
interface DocumentQueryParams {
    type?: DocumentType;
    status?: DocumentStatus;
    page?: number;
    limit?: number;
}
export declare class DocumentService {
    static getAllDocuments(userId: string, params?: DocumentQueryParams): Promise<{
        data: any[];
        meta: any;
    }>;
    static getDocumentById(userId: string, documentId: string): Promise<any>;
    static uploadDocument(userId: string, file: Express.Multer.File, data: UploadDocumentData): Promise<any>;
    static uploadNewVersion(userId: string, documentId: string, file: Express.Multer.File): Promise<any>;
    static deleteDocument(userId: string, documentId: string): Promise<void>;
    static downloadDocument(userId: string, documentId: string, versionId?: string): Promise<{
        stream: any;
        filename: string;
        mimeType: string;
        stat: any;
    }>;
    static getDocumentStats(userId: string): Promise<any>;
    static getAdminDocuments(params: DocumentQueryParams): Promise<{
        data: any[];
        meta: any;
    }>;
    static getAdminDocumentById(documentId: string): Promise<any>;
    static approveDocument(documentId: string, adminUserId: string, notes?: string): Promise<any>;
    static rejectDocument(documentId: string, adminUserId: string, reason: string): Promise<any>;
    static requestReupload(documentId: string, adminUserId: string, reason: string): Promise<any>;
    private static formatAdminDocument;
    private static formatDocument;
}
export {};
//# sourceMappingURL=document.service.d.ts.map