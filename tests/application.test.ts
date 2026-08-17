import request from "supertest";
import { createTestApp, TEST_USER } from "../helpers/testApp";
import { prisma } from "../src/config/prisma";

const app = createTestApp();

describe("Application Management", () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const existing = await prisma.user.findUnique({ where: { email: TEST_USER.email } });
    if (existing) {
      await prisma.studentProfile.deleteMany({ where: { userId: existing.id } });
      await prisma.user.delete({ where: { id: existing.id } });
    }

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        firstName: TEST_USER.firstName,
        lastName: TEST_USER.lastName,
        phoneNumber: TEST_USER.phoneNumber,
        email: TEST_USER.email,
        dateOfBirth: TEST_USER.dateOfBirth.toISOString().split("T")[0],
        nationality: TEST_USER.nationality,
        idNumber: TEST_USER.idNumber,
        idType: TEST_USER.idType,
        institution: TEST_USER.institution,
        course: TEST_USER.course,
        password: "TestPass123!",
        confirmPassword: "TestPass123!",
        termsAccepted: true,
      });

    accessToken = res.body.data.accessToken;
    userId = res.body.data.user.id;
  });

  describe("POST /api/v1/applications", () => {
    it("should create an attachment application", async () => {
      const response = await request(app)
        .post("/api/v1/applications")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          preferredStartDate: "2024-06-01",
          preferredEndDate: "2024-08-31",
          preferredLocation: "Nairobi",
          preferredIndustry: "Technology",
          preferredPlacementArea: "Software Development",
          coverLetter: "I am interested in this opportunity.",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.preferredLocation).toBe("Nairobi");
      expect(response.body.data.status).toBe("DRAFT");
    });
  });

  describe("GET /api/v1/applications/me", () => {
    it("should retrieve the student's application", async () => {
      const response = await request(app)
        .get("/api/v1/applications/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.preferredLocation).toBe("Nairobi");
    });

    it("should reject without auth", async () => {
      const response = await request(app).get("/api/v1/applications/me");
      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/v1/applications/:id", () => {
    it("should update application status", async () => {
      const appRes = await request(app)
        .get("/api/v1/applications/me")
        .set("Authorization", `Bearer ${accessToken}`);

      const appId = appRes.body.data.id;

      const response = await request(app)
        .patch(`/api/v1/applications/${appId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          status: "UNDER_REVIEW",
          adminNotes: "Application is being reviewed",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("UNDER_REVIEW");
    });

    it("should reject updating another student's application", async () => {
      const otherEmail = `other.${Date.now()}@example.com`;
      const otherRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "Other",
          lastName: "Student",
          phoneNumber: "254700000099",
          email: otherEmail,
          dateOfBirth: "2000-01-01",
          nationality: "Kenyan",
          idNumber: "ID99999999",
          idType: "NATIONAL_ID",
          institution: "Test University",
          course: "CS",
          password: "TestPass123!",
          confirmPassword: "TestPass123!",
          termsAccepted: true,
        });

      const appRes = await request(app)
        .get("/api/v1/applications/me")
        .set("Authorization", `Bearer ${accessToken}`);

      const appId = appRes.body.data.id;

      const response = await request(app)
        .patch(`/api/v1/applications/${appId}`)
        .set("Authorization", `Bearer ${otherRes.body.data.accessToken}`)
        .send({ status: "APPROVED" });

      expect(response.status).toBe(404);
    });
  });
});
