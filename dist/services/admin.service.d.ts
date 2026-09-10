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
    static getDashboardCharts(): Promise<any>;
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
    static createAgent(data: {
        email: string;
        firstName: string;
        lastName: string;
        middleName?: string;
        phoneNumber?: string;
        password: string;
        organizationId?: string;
        commissionRate?: number;
        createdBy: string;
    }): Promise<any>;
    static createStudent(data: {
        email: string;
        firstName: string;
        lastName: string;
        middleName?: string;
        phoneNumber?: string;
        password: string;
        dateOfBirth: Date;
        nationality: string;
        gender?: string;
        idNumber: string;
        idType: string;
        institution: string;
        course: string;
        department?: string;
        currentYear?: string;
        studentRegistrationNumber?: string;
        expectedGraduation?: Date;
        preferredStartDate?: Date;
        preferredEndDate?: Date;
        preferredLocation?: string;
        preferredIndustry?: string;
        preferredPlacementArea?: string;
        agentId?: string;
        createdBy: string;
    }): Promise<any>;
}
export {};
//# sourceMappingURL=admin.service.d.ts.map