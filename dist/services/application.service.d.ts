import { ApplicationStatus } from "@prisma/client";
interface CreateApplicationData {
    preferredStartDate?: Date;
    preferredEndDate?: Date;
    preferredLocation?: string;
    preferredIndustry?: string;
    preferredPlacementArea?: string;
    coverLetter?: string;
}
interface UpdateApplicationData {
    status?: ApplicationStatus;
    adminNotes?: string;
}
export declare class ApplicationService {
    static getMyApplication(userId: string): Promise<any>;
    static createApplication(userId: string, data: CreateApplicationData): Promise<any>;
    static updateApplication(userId: string, applicationId: string, data: UpdateApplicationData): Promise<any>;
    private static formatApplication;
}
export {};
//# sourceMappingURL=application.service.d.ts.map