interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare class OrganizationService {
    static getOrganizations(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<PaginatedResult<any>>;
    static getOrganizationById(orgId: string): Promise<any>;
    static createOrganization(data: {
        name: string;
        industry?: string;
        location?: string;
        contactPerson?: string;
        phone?: string;
        email?: string;
        website?: string;
        description?: string;
        totalSlots?: number;
    }): Promise<any>;
    static updateOrganization(orgId: string, data: any): Promise<any>;
    static suspendOrganization(orgId: string): Promise<any>;
    static activateOrganization(orgId: string): Promise<any>;
}
export {};
//# sourceMappingURL=organization.service.d.ts.map