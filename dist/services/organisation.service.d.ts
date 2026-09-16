interface RegisterData {
    phone: string;
    password: string;
    location?: string;
    companyName?: string;
    email?: string;
}
interface LoginData {
    email?: string;
    phone?: string;
    password: string;
}
export declare class OrganisationService {
    private static readonly TOKEN_EXPIRY_MS;
    private static hashToken;
    private static createRefreshToken;
    static register(data: RegisterData): Promise<{
        organisation: any;
        accessToken: string;
        refreshToken: string;
    }>;
    static login(data: LoginData): Promise<{
        organisation: any;
        accessToken: string;
        refreshToken: string;
    }>;
    static refresh(refreshToken: string): Promise<{
        accessToken: string;
        organisation: any;
    }>;
    static logout(refreshToken: string): Promise<void>;
    static getMe(organisationId: string): Promise<any>;
    static updateMe(organisationId: string, data: Record<string, any>): Promise<any>;
    static uploadProfileImage(organisationId: string, file: Express.Multer.File): Promise<any>;
    static getOrganisations(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<{
        data: any[];
        meta: any;
    }>;
    static getOrganisationById(orgId: string): Promise<any>;
    private static format;
}
export {};
//# sourceMappingURL=organisation.service.d.ts.map