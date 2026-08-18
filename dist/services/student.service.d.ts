interface UpdateProfileData {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    nationality?: string;
    gender?: string;
    idNumber?: string;
    idType?: string;
    studentRegistrationNumber?: string;
    institution?: string;
    course?: string;
    department?: string;
    currentYear?: string;
    expectedGraduation?: Date;
    preferredStartDate?: Date;
    preferredEndDate?: Date;
    preferredLocation?: string;
    preferredIndustry?: string;
    preferredPlacementArea?: string;
    profileCompleteness?: number;
}
export declare class StudentService {
    static getMyProfile(userId: string): Promise<any>;
    static updateMyProfile(userId: string, data: UpdateProfileData): Promise<any>;
}
export {};
//# sourceMappingURL=student.service.d.ts.map