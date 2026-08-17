import request from "supertest";
import { createTestApp } from "../helpers/testApp";
import { prisma } from "../src/config/prisma";

const app = createTestApp();

describe("Authentication", () => {
  const testEmail = `auth.test.${Date.now()}@example.com`;
  const testPassword = "TestPass123!";

  describe("POST /api/v1/auth/register", () => {
    it("should register a new student successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "John",
          middleName: "M",
          lastName: "Doe",
          phoneNumber: "254700000010",
          email: testEmail,
          dateOfBirth: "2000-01-01",
          nationality: "Kenyan",
          idNumber: "ID12345678",
          idType: "NATIONAL_ID",
          institution: "Test University",
          course: "Computer Science",
          department: "CS",
          currentYear: "3rd Year",
          expectedGraduation: "2024-12-31",
          preferredStartDate: "2024-06-01",
          preferredEndDate: "2024-08-31",
          preferredLocation: "Nairobi",
          preferredIndustry: "Technology",
          preferredPlacementArea: "Software Development",
          password: testPassword,
          confirmPassword: testPassword,
          termsAccepted: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testEmail);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it("should reject registration with duplicate email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "254700000011",
          email: testEmail,
          dateOfBirth: "2000-01-01",
          nationality: "Kenyan",
          idNumber: "ID12345678",
          idType: "NATIONAL_ID",
          institution: "Test University",
          course: "Computer Science",
          password: testPassword,
          confirmPassword: testPassword,
          termsAccepted: true,
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it("should reject registration without terms acceptance", async () => {
      const email = `terms.test.${Date.now()}@example.com`;
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "254700000013",
          email,
          dateOfBirth: "2000-01-01",
          nationality: "Kenyan",
          idNumber: "ID12345678",
          idType: "NATIONAL_ID",
          institution: "Test University",
          course: "Computer Science",
          password: testPassword,
          confirmPassword: testPassword,
          termsAccepted: false,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should reject registration with weak password", async () => {
      const email = `weak.pass.${Date.now()}@example.com`;
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "254700000014",
          email,
          dateOfBirth: "2000-01-01",
          nationality: "Kenyan",
          idNumber: "ID12345678",
          idType: "NATIONAL_ID",
          institution: "Test University",
          course: "Computer Science",
          password: "weak",
          confirmPassword: "weak",
          termsAccepted: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login an existing user successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(testEmail);
    });

    it("should reject login with wrong password", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword123!",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should reject login with non-existent email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: testPassword,
        });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    let refreshToken: string;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testEmail, password: testPassword });
      refreshToken = loginRes.body.data.refreshToken;
    });

    it("should refresh access token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    it("should return success message for existing email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: testEmail });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return same message for non-existent email (security)", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
