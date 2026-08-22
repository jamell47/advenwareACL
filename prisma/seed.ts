import { PrismaClient, UserRole, UserStatus, DocumentType, DocumentStatus, ApplicationStatus, PlacementStatus, PaymentStatus, CommissionStatus, WithdrawalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SystemSettingService } from "../src/services/systemSetting.service";

const prisma = new PrismaClient();

const DEV_PASSWORD = "Dev@123456";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Starting seed...");

  await SystemSettingService.seedDefaultSettings();
  console.log("Seeded system settings");

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@advenware.com" },
    update: {
      firstName: "Super",
      lastName: "Admin",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
      passwordHash: await hashPassword(DEV_PASSWORD),
    },
    create: {
      email: "superadmin@advenware.com",
      firstName: "Super",
      lastName: "Admin",
      passwordHash: await hashPassword(DEV_PASSWORD),
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
      studentProfile: {
        create: {
          institution: "ADVENWARE",
          course: "Administration",
        },
      },
    },
  });
  console.log("Super Admin:", superAdmin.email);

  const operationsAdmin = await prisma.user.upsert({
    where: { email: "ops.admin@advenware.com" },
    update: { role: UserRole.PLACEMENT_ADMIN, status: UserStatus.ACTIVE, isActive: true },
    create: {
      email: "ops.admin@advenware.com",
      firstName: "Operations",
      lastName: "Admin",
      passwordHash: await hashPassword(DEV_PASSWORD),
      role: UserRole.PLACEMENT_ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
      studentProfile: { create: { institution: "ADVENWARE", course: "Operations" } },
    },
  });
  console.log("Operations Admin:", operationsAdmin.email);

  const documentAdmin = await prisma.user.upsert({
    where: { email: "docs.admin@advenware.com" },
    update: { role: UserRole.DOCUMENT_ADMIN, status: UserStatus.ACTIVE, isActive: true },
    create: {
      email: "docs.admin@advenware.com",
      firstName: "Document",
      lastName: "Admin",
      passwordHash: await hashPassword(DEV_PASSWORD),
      role: UserRole.DOCUMENT_ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
      studentProfile: { create: { institution: "ADVENWARE", course: "Document Review" } },
    },
  });
  console.log("Document Admin:", documentAdmin.email);

  const financeAdmin = await prisma.user.upsert({
    where: { email: "finance.admin@advenware.com" },
    update: { role: UserRole.FINANCE, status: UserStatus.ACTIVE, isActive: true },
    create: {
      email: "finance.admin@advenware.com",
      firstName: "Finance",
      lastName: "Admin",
      passwordHash: await hashPassword(DEV_PASSWORD),
      role: UserRole.FINANCE,
      status: UserStatus.ACTIVE,
      isActive: true,
      studentProfile: { create: { institution: "ADVENWARE", course: "Finance" } },
    },
  });
  console.log("Finance Admin:", financeAdmin.email);

  const supportAdmin = await prisma.user.upsert({
    where: { email: "support.admin@advenware.com" },
    update: { role: UserRole.SUPPORT, status: UserStatus.ACTIVE, isActive: true },
    create: {
      email: "support.admin@advenware.com",
      firstName: "Support",
      lastName: "Admin",
      passwordHash: await hashPassword(DEV_PASSWORD),
      role: UserRole.SUPPORT,
      status: UserStatus.ACTIVE,
      isActive: true,
      studentProfile: { create: { institution: "ADVENWARE", course: "Support" } },
    },
  });
  console.log("Support Admin:", supportAdmin.email);

  const agentManager = await prisma.user.upsert({
    where: { email: "agent.manager@advenware.com" },
    update: { role: UserRole.AGENT, status: UserStatus.ACTIVE, isActive: true, agentId: null },
    create: {
      email: "agent.manager@advenware.com",
      firstName: "Agent",
      lastName: "Manager",
      passwordHash: await hashPassword(DEV_PASSWORD),
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
      isActive: true,
      studentProfile: { create: { institution: "ADVENWARE", course: "Agent Management" } },
    },
  });
  console.log("Agent Manager:", agentManager.email);

  const partnershipAdmin = await prisma.user.upsert({
    where: { email: "partnerships@advenware.com" },
    update: { role: UserRole.ADMIN, status: UserStatus.ACTIVE, isActive: true },
    create: {
      email: "partnerships@advenware.com",
      firstName: "Partnership",
      lastName: "Admin",
      passwordHash: await hashPassword(DEV_PASSWORD),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
      studentProfile: { create: { institution: "ADVENWARE", course: "Partnerships" } },
    },
  });
  console.log("Partnership Admin:", partnershipAdmin.email);

  const organizations: any[] = [];
  const orgNames = [
    { name: "TechCorp Kenya", industry: "Technology", location: "Nairobi, Kenya", slots: 10 },
    { name: "BankPro Ltd", industry: "Finance", location: "Nairobi, Kenya", slots: 8 },
    { name: "MediaHouse Group", industry: "Media", location: "Nairobi, Kenya", slots: 5 },
    { name: "EduCore Solutions", industry: "Education", location: "Kisumu, Kenya", slots: 6 },
    { name: "HealthPlus Clinic", industry: "Healthcare", location: "Mombasa, Kenya", slots: 4 },
    { name: "AgriTech Farms", industry: "Agriculture", location: "Nakuru, Kenya", slots: 3 },
    { name: "BuildRight Construction", industry: "Construction", location: "Eldoret, Kenya", slots: 5 },
  ];

  for (const orgData of orgNames) {
    const existing = await prisma.organization.findFirst({
      where: { name: orgData.name },
    });
    let org;
    if (existing) {
      org = await prisma.organization.update({
        where: { id: existing.id },
        data: {
          industry: orgData.industry,
          location: orgData.location,
          totalSlots: orgData.slots,
          availableSlots: Math.floor(orgData.slots / 2),
          status: "ACTIVE",
        },
      });
    } else {
      org = await prisma.organization.create({
        data: {
          name: orgData.name,
          industry: orgData.industry,
          location: orgData.location,
          contactPerson: "HR Manager",
          phone: "254700000000",
          email: `hr@${orgData.name.toLowerCase().replace(/\s/g, "")}.com`,
          totalSlots: orgData.slots,
          availableSlots: Math.floor(orgData.slots / 2),
          description: `${orgData.name} - ${orgData.industry} company in ${orgData.location}`,
          status: "ACTIVE",
        },
      });
    }
    organizations.push(org);
    console.log("Organization:", org.name);
  }

  const agents: any[] = [];
  const agentNames = [
    { first: "James", last: "Ochieng", email: "agent1@advenware.com", phone: "254711000001" },
    { first: "Mary", last: "Adhiambo", email: "agent2@advenware.com", phone: "254711000002" },
    { first: "David", last: "Mutiso", email: "agent3@advenware.com", phone: "254711000003" },
  ];

  const agentProfiles: any[] = [];
  for (let i = 0; i < agentNames.length; i++) {
    const data = agentNames[i];
    const agent = await prisma.user.upsert({
      where: { email: data.email },
      update: { role: UserRole.AGENT, status: UserStatus.ACTIVE, isActive: true },
      create: {
        email: data.email,
        firstName: data.first,
        lastName: data.last,
        phoneNumber: data.phone,
        passwordHash: await hashPassword(DEV_PASSWORD),
        role: UserRole.AGENT,
        status: UserStatus.ACTIVE,
        isActive: true,
        agentProfile: {
          create: {
            organization: { connect: { id: organizations[i % organizations.length].id } },
            isApproved: true,
            commissionRate: 500,
          },
        },
      },
      include: { agentProfile: true },
    });
    agents.push(agent);

    agentProfiles.push({
      agentId: agent.id,
      organization: organizations[i % organizations.length].name,
      agentName: `${data.first} ${data.last}`,
    });
    console.log("Agent:", agent.email);
  }

  const institutions = ["University of Nairobi", "Kenya Methodist University", "Strathmore University", "JKUAT", "Moi University", "KEMU", "Daystar University"];
  const courses = ["Computer Science", "Information Technology", "Software Engineering", "Business Administration", "Finance", "Mass Communication", "Nursing"];
  const applicationStatuses = [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.APPROVED, ApplicationStatus.SEARCHING, ApplicationStatus.MATCHED, ApplicationStatus.PLACEMENT_CONFIRMED, ApplicationStatus.REJECTED];
  const documentTypes = [
    DocumentType.NATIONAL_ID,
    DocumentType.ATTACHMENT_LETTER,
    DocumentType.INTRODUCTION_LETTER,
    DocumentType.CV,
    DocumentType.ACADEMIC_CERTIFICATE,
    DocumentType.TRANSCRIPT,
    DocumentType.RECOMMENDATION_LETTER,
  ];
  const documentStatuses = [DocumentStatus.APPROVED, DocumentStatus.PENDING_REVIEW, DocumentStatus.REJECTED, DocumentStatus.REUPLOAD_REQUIRED];

  let createdStudents = 0;
  let createdApplications = 0;
  let createdDocuments = 0;
  let createdPlacements = 0;
  let createdPayments = 0;
  let createdCommissions = 0;
  let createdWithdrawals = 0;
  let placedStudents = 0;
  let paidStudents = 0;

  for (let i = 1; i <= 10; i++) {
    const institution = institutions[i % institutions.length];
    const course = courses[i % courses.length];
    const agent = agents[i % agents.length];

    const student = await prisma.user.upsert({
      where: { email: `student${i}@example.com` },
      update: {
        firstName: `Student${i}`,
        lastName: "User",
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        isActive: true,
        agentId: i <= 7 ? agent?.id : undefined,
      },
      create: {
        email: `student${i}@example.com`,
        firstName: `Student${i}`,
        lastName: "User",
        phoneNumber: `254720000${i.toString().padStart(3, "0")}`,
        passwordHash: await hashPassword(DEV_PASSWORD),
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        isActive: true,
        agentId: i <= 7 ? agent?.id : undefined,
        studentProfile: {
          create: {
            institution,
            course,
            department: "Undergraduate",
            studentRegistrationNumber: `STU${i}/${new Date().getFullYear()}`,
            dateOfBirth: new Date(2000 + i, 0, 1),
            nationality: "Kenyan",
            idNumber: `ID${10000000 + i}`,
            idType: "NATIONAL_ID",
            preferredStartDate: new Date(2024, 5, 1),
            preferredEndDate: new Date(2024, 7, 31),
            preferredLocation: "Nairobi, Kenya",
            preferredIndustry: "Technology",
            preferredPlacementArea: "Software Development",
            profileCompleteness: 80,
          },
        },
      },
      include: { studentProfile: true },
    });

    createdStudents++;

    const appStatus = applicationStatuses[i % applicationStatuses.length];
    const application = await prisma.attachmentApplication.upsert({
      where: { studentProfileId: student.studentProfile!.id },
      update: {
        preferredStartDate: new Date(2024, 5, 1),
        preferredEndDate: new Date(2024, 7, 31),
        preferredLocation: "Nairobi, Kenya",
        preferredIndustry: "Technology",
        preferredPlacementArea: "Software Development",
        coverLetter: `Dear Hiring Manager, I am Student${i} seeking an attachment opportunity...`,
        status: appStatus,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        ...(appStatus !== ApplicationStatus.UNDER_REVIEW
          ? { reviewedBy: operationsAdmin.id, reviewedAt: new Date() }
          : {}),
        ...(appStatus === ApplicationStatus.REJECTED ? { adminNotes: "Insufficient qualifications" } : {}),
      },
      create: {
        userId: student.id,
        studentProfileId: student.studentProfile!.id,
        preferredStartDate: new Date(2024, 5, 1),
        preferredEndDate: new Date(2024, 7, 31),
        preferredLocation: "Nairobi, Kenya",
        preferredIndustry: "Technology",
        preferredPlacementArea: "Software Development",
        coverLetter: `Dear Hiring Manager, I am Student${i} seeking an attachment opportunity...`,
        status: appStatus,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        ...(appStatus !== ApplicationStatus.UNDER_REVIEW
          ? { reviewedBy: operationsAdmin.id, reviewedAt: new Date() }
          : {}),
        ...(appStatus === ApplicationStatus.REJECTED ? { adminNotes: "Insufficient qualifications" } : {}),
      },
    });
    createdApplications++;

    for (let j = 0; j < 3; j++) {
      const docType = documentTypes[j % documentTypes.length];
      const docStatus = documentStatuses[j % documentStatuses.length];

      await prisma.document.create({
        data: {
          userId: student.id,
          studentProfileId: student.studentProfile?.id,
          applicationId: application.id,
          type: docType,
          fileName: `document_${j}_${student.id.slice(0, 8)}.pdf`,
          fileSize: 1024 * 500 + i * 100,
          mimeType: "application/pdf",
          filePath: `documents/${student.id}/document_${j}.pdf`,
          status: docStatus,
          isRequired: j === 0,
          rejectionReason: docStatus === DocumentStatus.REJECTED ? "Document unclear, please re-upload" : null,
          reviewedBy: docStatus === DocumentStatus.APPROVED ? documentAdmin.id : null,
          reviewedAt: docStatus === DocumentStatus.APPROVED ? new Date() : null,
          uploadedAt: new Date(),
          versions: {
            create: {
              version: 1,
              filePath: `documents/${student.id}/document_${j}.pdf`,
              fileName: `document_${j}_${student.id.slice(0, 8)}.pdf`,
              fileSize: 1024 * 500 + i * 100,
              mimeType: "application/pdf",
            },
          },
        },
      });
      createdDocuments++;
    }

    if (i >= 4 && student.agentId) {
      const org = organizations[(i - 4) % organizations.length];
      const placementStatus = i <= 7 ? PlacementStatus.CONFIRMED : PlacementStatus.MATCHED;

      const placement = await prisma.placement.upsert({
        where: { applicationId: application.id },
        update: {
          userId: student.id,
          organizationId: org.id,
          organizationName: org.name,
          department: `${course} Department`,
          positionTitle: course === "Computer Science" ? "Software Development Intern" : course === "Business Administration" ? "Business Analyst Intern" : "IT Support Intern",
          location: org.location,
          supervisorName: "John Smith",
          supervisorPhone: "254700000100",
          supervisorEmail: `supervisor@${org.name.toLowerCase().replace(/\s/g, "")}.com`,
          startDate: new Date(2024, 5, 15),
          endDate: new Date(2024, 8, 15),
          status: placementStatus,
          placementFee: 1500,
          feeAmount: 1500,
          commissionAmount: 500,
          matchedAt: placementStatus !== PlacementStatus.CONFIRMED ? new Date() : undefined,
          confirmedAt: placementStatus === PlacementStatus.CONFIRMED ? new Date() : undefined,
        },
        create: {
          userId: student.id,
          applicationId: application.id,
          organizationId: org.id,
          organizationName: org.name,
          department: `${course} Department`,
          positionTitle: course === "Computer Science" ? "Software Development Intern" : course === "Business Administration" ? "Business Analyst Intern" : "IT Support Intern",
          location: org.location,
          supervisorName: "John Smith",
          supervisorPhone: "254700000100",
          supervisorEmail: `supervisor@${org.name.toLowerCase().replace(/\s/g, "")}.com`,
          startDate: new Date(2024, 5, 15),
          endDate: new Date(2024, 8, 15),
          status: placementStatus,
          placementFee: 1500,
          feeAmount: 1500,
          commissionAmount: 500,
          matchedAt: placementStatus !== PlacementStatus.CONFIRMED ? new Date() : undefined,
          confirmedAt: placementStatus === PlacementStatus.CONFIRMED ? new Date() : undefined,
        },
      });
      createdPlacements++;

      if (placement.status === PlacementStatus.CONFIRMED) {
        placedStudents++;

        const existingCommission = await prisma.commission.findFirst({
          where: { placementId: placement.id },
        });

        let commission;
        if (existingCommission) {
          commission = await prisma.commission.update({
            where: { id: existingCommission.id },
            data: {
              agentId: student.agentId!,
              amount: 500,
              currency: "KES",
              status: CommissionStatus.ELIGIBLE,
              eligibleAt: new Date(),
            },
          });
        } else {
          commission = await prisma.commission.create({
            data: {
              placementId: placement.id,
              agentId: student.agentId!,
              amount: 500,
              currency: "KES",
              status: CommissionStatus.ELIGIBLE,
              eligibleAt: new Date(),
            },
          });
        }
        createdCommissions++;

        await prisma.payment.upsert({
          where: { placementId: placement.id },
          update: {
            userId: student.id,
            amount: 1500,
            currency: "KES",
            method: "MPESA",
            status: i <= 6 ? PaymentStatus.SUCCESSFUL : PaymentStatus.PENDING,
            mpesaReceiptNumber: i <= 6 ? `MP${student.id.slice(0, 8)}${i}` : null,
            transactionId: i <= 6 ? `TXN${student.id.slice(0, 8)}` : null,
            confirmedAt: i <= 6 ? new Date() : null,
          },
          create: {
            userId: student.id,
            placementId: placement.id,
            amount: 1500,
            currency: "KES",
            method: "MPESA",
            status: i <= 6 ? PaymentStatus.SUCCESSFUL : PaymentStatus.PENDING,
            mpesaReceiptNumber: i <= 6 ? `MP${student.id.slice(0, 8)}${i}` : null,
            transactionId: i <= 6 ? `TXN${student.id.slice(0, 8)}` : null,
            confirmedAt: i <= 6 ? new Date() : null,
          },
        });
        createdPayments++;

        if (i <= 6) {
          paidStudents++;

          if (i % 3 === 0) {
            const withdrawal = await prisma.withdrawal.create({
              data: {
                agentId: student.agentId,
                amount: 1000,
                currency: "KES",
                method: "MPESA",
                phone: "25471100000" + (i % 3 === 0 ? "1" : "2"),
                status: WithdrawalStatus.PENDING,
              },
            });
            createdWithdrawals++;
          }

          if (commission.status === CommissionStatus.ELIGIBLE && i % 4 === 0) {
            await prisma.commission.update({
              where: { id: commission.id },
              data: { status: CommissionStatus.PAID, paidAt: new Date(), paymentRef: `WD${commission.id.slice(0, 8)}` },
            });
          }
        }
      }
    }

    if (i <= 3) {
      await prisma.conversation.create({
        data: {
          studentId: student.id,
          subject: `Regarding application for ${course}`,
          isResolved: i <= 2,
          participants: {
            create: [
              { userId: student.id, role: "STUDENT" },
              { userId: supportAdmin.id, role: "SUPPORT" },
            ],
          },
          messages: {
            create: [
              {
                senderId: student.id,
                receiverId: supportAdmin.id,
                message: `Hello, I have a question about my ${course} attachment application.`,
                sentAt: new Date(),
                isRead: true,
                readAt: new Date(),
              },
              {
                senderId: supportAdmin.id,
                receiverId: student.id,
                message: "Hi there! I'd be happy to help. What would you like to know about your application?",
                sentAt: new Date(Date.now() - 60000),
                isRead: true,
                readAt: new Date(Date.now() - 50000),
              },
            ],
          },
        },
      });

      await prisma.notification.create({
        data: {
          userId: student.id,
          type: "MESSAGE_RECEIVED",
          title: "New Message",
          message: "You have a new message from support.",
          data: { conversationId: student.id },
        },
      });
    }
  }

  for (const profile of agentProfiles) {
    await prisma.agentProfile.upsert({
      where: { userId: profile.agentId },
      update: {
        organization: { connect: { id: organizations[agentProfiles.indexOf(profile) % organizations.length].id } },
        isApproved: true,
        commissionRate: 500,
      },
      create: {
        userId: profile.agentId,
        organizationId: organizations[agentProfiles.indexOf(profile) % organizations.length].id,
        isApproved: true,
        commissionRate: 500,
      },
    });
  }

  console.log(`Seed complete: ${createdStudents} students, ${createdApplications} applications, ${createdDocuments} documents, ${createdPlacements} placements, ${createdPayments} payments, ${createdCommissions} commissions, ${createdWithdrawals} withdrawals`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
