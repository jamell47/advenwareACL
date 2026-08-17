import request from "supertest";
import { createTestApp } from "../helpers/testApp";
import { prisma } from "../src/config/prisma";

const app = createTestApp();

describe("Placement", () => {
  let accessToken: string;
  let placementId: string;

  const testEmail = `placement.test.${Date.now()}@example.com`;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        firstName: "Placement",
        lastName: "Tester",
        phoneNumber: "254700000050",
        email: testEmail,
        dateOfBirth: "2000-01-01",
        nationality: "Kenyan",
        idNumber: "ID12345678",
        idType: "NATIONAL_ID",
        institution: "Test University",
        course: "Computer Science",
        password: "TestPass123!",
        confirmPassword: "TestPass123!",
        termsAccepted: true,
      });

    accessToken = res.body.data.accessToken;

    const appRes = await request(app)
      .get("/api/v1/applications/me")
      .set("Authorization", `Bearer ${accessToken}`);

    const student = await prisma.studentProfile.findUnique({
      where: { userId: res.body.data.user.id },
    });

    const placement = await prisma.placement.create({
      data: {
        userId: res.body.data.user.id,
        organizationName: "Test Organization",
        positionTitle: "Software Developer Intern",
        location: "Nairobi, Kenya",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-08-31"),
        status: "MATCHED",
        feeAmount: 1500,
        commissionAmount: 500,
        matchedAt: new Date(),
      },
    });

    placementId = placement.id;
  });

  describe("GET /api/v1/placements/me", () => {
    it("should retrieve the student's placement", async () => {
      const response = await request(app)
        .get("/api/v1/placements/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.organizationName).toBe("Test Organization");
    });

    it("should reject without auth", async () => {
      const response = await request(app).get("/api/v1/placements/me");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/v1/placements/all", () => {
    it("should retrieve all placements", async () => {
      const response = await request(app)
        .get("/api/v1/placements/all")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
