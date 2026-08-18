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
export declare class AgentService {
    static getAgentDashboard(agentId: string): Promise<any>;
    static getAgents(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<PaginatedResult<any>>;
    static getAgentById(agentId: string): Promise<any>;
    static approveAgent(agentId: string): Promise<any>;
    static suspendAgent(agentId: string): Promise<any>;
    static activateAgent(agentId: string): Promise<any>;
    static getAgentStudents(agentId: string, params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<PaginatedResult<any>>;
    static registerStudentByAgent(agentId: string, data: any): Promise<any>;
    static getAgentCommissionHistory(agentId: string, params: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResult<any>>;
    static getAgentWithdrawals(agentId: string, params: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResult<any>>;
    static requestWithdrawal(agentId: string, data: {
        amount: number;
        phone?: string;
        method?: string;
    }): Promise<any>;
    static createCommission(placementId: string, agentId: string, amount: number): Promise<any>;
}
export {};
//# sourceMappingURL=agent.service.d.ts.map