import request from "supertest";
import { createTestApp, generateTestToken, TEST_USER } from "../helpers/testApp";
import { prisma } from "../src/config/prisma";

const app = createTestApp();

describe("Student Profile", () => {
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

  describe("GET /api/v1/students/me", () => {
    it("should retrieve student profile with auth token", async () => {
      const response = await request(app)
        .get("/api/v1/students/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(TEST_USER.email);
      expect(response.body.data.firstName).toBe(TEST_USER.firstName);
      expect(response.body.data.studentProfile).toBeDefined();
    });

    it("should reject without auth token", async () => {
      const response = await request(app).get("/api/v1/students/me");
      expect(response.status).toBe(401);
    });

    it("should reject with invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/students/me")
        .set("Authorization", "Bearer invalid.token.here");
      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/v1/students/me", () => {
    it("should update student profile", async () => {
      const response = await request(app)
        .patch("/api/v1/students/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          firstName: "Updated",
          preferredLocation: "Mombasa",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe("Updated");
      expect(response.body.data.preferredLocation).toBe("Mombasa");
    });
  });
});
