import { OrganisationRequestStatus, OrganisationRequestType } from "@prisma/client";
interface RequestQueryParams {
    page?: number;
    limit?: number;
    status?: string;
    requestType?: string;
    search?: string;
}
interface CreateRequestData {
    requestType: OrganisationRequestType;
    numberOfStudents: number;
    course?: string;
    description?: string;
}
interface UpdateRequestData {
    requestType?: OrganisationRequestType;
    numberOfStudents?: number;
    course?: string;
    description?: string;
}
export declare class OrganisationRequestService {
    static createRequest(organisationId: string, data: CreateRequestData): Promise<any>;
    static getRequests(organisationId: string, params?: RequestQueryParams): Promise<{
        data: any[];
        meta: any;
    }>;
    static getRequestById(organisationId: string, requestId: string): Promise<any>;
    static updateRequest(organisationId: string, requestId: string, data: UpdateRequestData): Promise<any>;
    static cancelRequest(organisationId: string, requestId: string): Promise<any>;
    static getRequestStats(organisationId: string): Promise<any>;
    static countByOrganisation(organisationId: string): Promise<number>;
    static getAllRequests(params?: RequestQueryParams): Promise<{
        data: any[];
        meta: any;
    }>;
    static getRequestByIdAdmin(requestId: string): Promise<any>;
    static updateRequestStatus(requestId: string, status: OrganisationRequestStatus, notes?: string): Promise<any>;
    private static format;
}
export {};
//# sourceMappingURL=organisationRequest.service.d.ts.map