import { CommissionStatus } from "@prisma/client";
interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        totals?: Record<string, number>;
        [key: string]: any;
    };
}
export declare class CommissionService {
    static getAllCommissions(params: {
        page?: number;
        limit?: number;
        status?: string;
        agentId?: string;
    }): Promise<PaginatedResult<any>>;
    static getCommissionById(commissionId: string): Promise<any>;
    static updateCommissionStatus(commissionId: string, status: CommissionStatus, paymentRef?: string): Promise<any>;
    static createCommissionForPayment(paymentId: string): Promise<any>;
}
export {};
//# sourceMappingURL=commission.service.d.ts.map