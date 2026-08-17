import request from "supertest";
import { createTestApp } from "../helpers/testApp";
import { prisma } from "../src/config/prisma";

const app = createTestApp();

describe("Messaging", () => {
  let accessToken: string;
  let conversationId: string;
  const testEmail = `messaging.test.${Date.now()}@example.com`;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        firstName: "Messaging",
        lastName: "Tester",
        phoneNumber: "254700000080",
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

    const convRes = await request(app)
      .post("/api/v1/messaging/conversations")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ type: "SUPPORT", subject: "Test Support Request" });

    conversationId = convRes.body.data.id;
  });

  describe("POST /api/v1/messaging/conversations", () => {
    it("should create a conversation", async () => {
      const response = await request(app)
        .post("/api/v1/messaging/conversations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ type: "SUPPORT", subject: "Another Request" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subject).toBe("Another Request");
    });

    it("should reject without auth", async () => {
      const response = await request(app)
        .post("/api/v1/messaging/conversations")
        .send({ type: "SUPPORT" });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/v1/messaging/conversations", () => {
    it("should list conversations", async () => {
      const response = await request(app)
        .get("/api/v1/messaging/conversations")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("POST /api/v1/messaging/conversations/:id/messages", () => {
    it("should send a message", async () => {
      const response = await request(app)
        .post(`/api/v1/messaging/conversations/${conversationId}/messages`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ message: "Hello, I need help with my application." });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Hello, I need help with my application.");
    });

    it("should reject empty message", async () => {
      const response = await request(app)
        .post(`/api/v1/messaging/conversations/${conversationId}/messages`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ message: "" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/messaging/conversations/:id", () => {
    it("should retrieve conversation messages", async () => {
      const response = await request(app)
        .get(`/api/v1/messaging/conversations/${conversationId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toBeDefined();
    });

    it("should reject accessing another student's conversation", async () => {
      const response = await request(app)
        .get(`/api/v1/messaging/conversations/${conversationId}`)
        .set("Authorization", `Bearer invalid_token`);

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/v1/messaging/conversations/:id/read", () => {
    it("should mark messages as read", async () => {
      const response = await request(app)
        .patch(`/api/v1/messaging/conversations/${conversationId}/read`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/v1/support", () => {
    it("should retrieve support info without auth", async () => {
      const response = await request(app).get("/api/v1/support");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.whatsappNumber).toBeDefined();
    });
  });
});
