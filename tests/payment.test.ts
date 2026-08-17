import request from "supertest";
import { createTestApp } from "../helpers/testApp";
import { prisma } from "../src/config/prisma";

const app = createTestApp();

describe("Payment", () => {
  let accessToken: string;
  let paymentId: string;
  const testEmail = `payment.test.${Date.now()}@example.com`;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        firstName: "Payment",
        lastName: "Tester",
        phoneNumber: "254700000060",
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
    const userId = res.body.data.user.id;

    await prisma.placement.create({
      data: {
        userId,
        organizationName: "Test Org",
        positionTitle: "Intern",
        location: "Nairobi",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-08-31"),
        status: "CONFIRMED",
        feeAmount: 1500,
        commissionAmount: 500,
        confirmedAt: new Date(),
      },
    });

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: 1500,
        currency: "KES",
        method: "MPESA",
        status: "PENDING",
      },
    });

    paymentId = payment.id;
  });

  describe("GET /api/v1/payments/me", () => {
    it("should retrieve payment history", async () => {
      const response = await request(app)
        .get("/api/v1/payments/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should reject without auth", async () => {
      const response = await request(app).get("/api/v1/payments/me");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/v1/payments/:id", () => {
    it("should retrieve a specific payment", async () => {
      const response = await request(app)
        .get(`/api/v1/payments/${paymentId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(paymentId);
      expect(response.body.data.amount).toBe(1500);
    });

    it("should return 404 for non-existent payment", async () => {
      const response = await request(app)
        .get("/api/v1/payments/nonexistent-id")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/v1/payments/stk-push", () => {
    it("should initiate STK push for confirmed placement", async () => {
      const response = await request(app)
        .post("/api/v1/payments/stk-push")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ phoneNumber: "254700000000" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("checkoutRequestId");
    });

    it("should reject without auth", async () => {
      const response = await request(app)
        .post("/api/v1/payments/stk-push")
        .send({ phoneNumber: "254700000000" });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/v1/payments/callback", () => {
    it("should process a successful payment callback", async () => {
      const response = await request(app)
        .post("/api/v1/payments/callback")
        .send({
          Body: {
            stkCallback: {
              checkoutRequestId: "test-checkout-123",
              resultCode: 0,
              resultDesc: "Success",
              callbackMetadata: {
                item: [
                  { name: "Amount", value: 1500 },
                  { name: "ReceiptNo", value: "TESTRECEIPT123" },
                ],
              },
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
