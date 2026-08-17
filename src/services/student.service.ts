import { prisma } from "../config/prisma";
import { APIError } from "../middleware/errorHandler";

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

function formatProfile(user: any) {
  const profile = user.studentProfile;
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImage,
    role: user.role,
    status: user.status,
    dateOfBirth: profile?.dateOfBirth,
    nationality: profile?.nationality,
    gender: profile?.gender,
    idNumber: profile?.idNumber,
    idType: profile?.idType,
    studentRegistrationNumber: profile?.studentRegistrationNumber,
    institution: profile?.institution,
    course: profile?.course,
    department: profile?.department,
    currentYear: profile?.currentYear,
    expectedGraduation: profile?.expectedGraduation,
    preferredStartDate: profile?.preferredStartDate,
    preferredEndDate: profile?.preferredEndDate,
    preferredLocation: profile?.preferredLocation,
    preferredIndustry: profile?.preferredIndustry,
    preferredPlacementArea: profile?.preferredPlacementArea,
    profileCompleteness: profile?.profileCompleteness,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class StudentService {
  static async getMyProfile(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      throw new APIError("User not found", 404, "USER_NOT_FOUND");
    }

    return formatProfile(user);
  }

  static async updateMyProfile(userId: string, data: UpdateProfileData): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new APIError("User not found", 404, "USER_NOT_FOUND");
    }

    const profileData: any = {
      dateOfBirth: data.dateOfBirth,
      nationality: data.nationality,
      gender: data.gender,
      idNumber: data.idNumber,
      idType: data.idType,
      studentRegistrationNumber: data.studentRegistrationNumber,
      institution: data.institution,
      course: data.course,
      department: data.department,
      currentYear: data.currentYear,
      expectedGraduation: data.expectedGraduation,
      preferredStartDate: data.preferredStartDate,
      preferredEndDate: data.preferredEndDate,
      preferredLocation: data.preferredLocation,
      preferredIndustry: data.preferredIndustry,
      preferredPlacementArea: data.preferredPlacementArea,
      profileCompleteness: data.profileCompleteness,
    };

    await prisma.studentProfile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData,
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      },
      include: {
        studentProfile: true,
      },
    });

    return formatProfile(updatedUser);
  }
}
