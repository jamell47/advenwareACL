interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        totals?: Record<string, number>;
    };
}
export declare class WithdrawalService {
    static getAllWithdrawals(params: {
        page?: number;
        limit?: number;
        status?: string;
        agentId?: string;
    }): Promise<PaginatedResult<any>>;
    static getWithdrawalById(withdrawalId: string): Promise<any>;
    static approveWithdrawal(withdrawalId: string, adminUserId: string): Promise<any>;
    static rejectWithdrawal(withdrawalId: string, adminUserId: string, reason: string): Promise<any>;
    static processWithdrawalB2C(withdrawalId: string, adminUserId: string): Promise<any>;
    static getAgentWithdrawalStats(agentId: string): Promise<any>;
}
export {};
//# sourceMappingURL=withdrawal.service.d.ts.map