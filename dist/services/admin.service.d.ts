interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare class AdminService {
    static getDashboardStats(): Promise<any>;
    static getStudents(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        institution?: string;
        course?: string;
        agentId?: string;
    }): Promise<PaginatedResult<any>>;
    private static formatStudent;
    static getStudentById(studentId: string): Promise<any>;
    static updateStudent(studentId: string, data: any): Promise<any>;
    static suspendStudent(studentId: string): Promise<any>;
    static activateStudent(studentId: string): Promise<any>;
    static getAdmins(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<PaginatedResult<any>>;
    static getRoles(): Promise<any[]>;
    static getAuditLogs(params: {
        page?: number;
        limit?: number;
        action?: string;
        entityType?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<PaginatedResult<any>>;
}
export {};
//# sourceMappingURL=admin.service.d.ts.map