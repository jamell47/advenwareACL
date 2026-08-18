interface RegisterData {
    firstName: string;
    middleName?: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    dateOfBirth: Date;
    nationality: string;
    gender?: string;
    idType: string;
    idNumber: string;
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
    password: string;
    termsAccepted: boolean;
}
interface LoginData {
    email: string;
    password: string;
}
export declare class AuthService {
    private static generateAccessToken;
    private static generateRefreshToken;
    static register(data: RegisterData): Promise<{
        user: any;
        accessToken: string;
        refreshToken: string;
    }>;
    static login(data: LoginData): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    static refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        user: any;
    }>;
    static logout(refreshToken: string): Promise<void>;
    static forgotPassword(email: string): Promise<void>;
    static resetPassword(token: string, newPassword: string): Promise<void>;
}
export {};
//# sourceMappingURL=auth.service.d.ts.map