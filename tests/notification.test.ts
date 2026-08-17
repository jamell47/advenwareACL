import request from "supertest";
import { createTestApp } from "../helpers/testApp";
import { prisma } from "../src/config/prisma";

const app = createTestApp();

describe("Notifications", () => {
  let accessToken: string;
  let notificationId: string;
  const testEmail = `notif.test.${Date.now()}@example.com`;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        firstName: "Notif",
        lastName: "Tester",
        phoneNumber: "254700000070",
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

    await prisma.notification.createMany({
      data: [
        {
          userId: res.body.data.user.id,
          type: "APPLICATION_RECEIVED",
          title: "Application Received",
          message: "Your application has been received.",
          isRead: false,
        },
        {
          userId: res.body.data.user.id,
          type: "DOCUMENT_APPROVED",
          title: "Document Approved",
          message: "Your passport has been approved.",
          isRead: false,
        },
      ],
    });

    const notif = await prisma.notification.findFirst({
      where: { userId: res.body.data.user.id },
    });
    notificationId = notif!.id;
  });

  describe("GET /api/v1/notifications", () => {
    it("should retrieve all notifications", async () => {
      const response = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should reject without auth", async () => {
      const response = await request(app).get("/api/v1/notifications");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/v1/notifications/unread-count", () => {
    it("should return unread count", async () => {
      const response = await request(app)
        .get("/api/v1/notifications/unread-count")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBeGreaterThan(0);
    });
  });

  describe("PATCH /api/v1/notifications/:id/read", () => {
    it("should mark a notification as read", async () => {
      const response = await request(app)
        .patch(`/api/v1/notifications/${notificationId}/read`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("PATCH /api/v1/notifications/read-all", () => {
    it("should mark all as read", async () => {
      const response = await request(app)
        .patch("/api/v1/notifications/read-all")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
