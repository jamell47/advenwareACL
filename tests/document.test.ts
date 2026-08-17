import request from "supertest";
import { createTestApp, TEST_USER } from "../helpers/testApp";
import { prisma } from "../src/config/prisma";

const app = createTestApp();

describe("Document Management", () => {
  let accessToken: string;

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
  });

  describe("POST /api/v1/documents (upload)", () => {
    it("should upload a document successfully", async () => {
      const response = await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("type", "NATIONAL_ID")
        .attach("file", Buffer.from("fake-pdf-content"), "test_id.pdf");

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe("NATIONAL_ID");
      expect(response.body.data.status).toBe("PENDING_REVIEW");
    });

    it("should reject upload without auth", async () => {
      const response = await request(app)
        .post("/api/v1/documents")
        .field("type", "NATIONAL_ID")
        .attach("file", Buffer.from("fake"), "test.pdf");

      expect(response.status).toBe(401);
    });

    it("should reject upload without file", async () => {
      const response = await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("type", "NATIONAL_ID");

      expect(response.status).toBe(400);
    });

    it("should reject invalid file type", async () => {
      const response = await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("type", "NATIONAL_ID")
        .attach("file", Buffer.from("fake"), "test.exe");

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/documents", () => {
    it("should list all documents for the student", async () => {
      const response = await request(app)
        .get("/api/v1/documents")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/v1/documents/:id", () => {
    it("should retrieve a document by ID", async () => {
      await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("type", "PASSPORT")
        .attach("file", Buffer.from("fake"), "passport.pdf");

      const listRes = await request(app)
        .get("/api/v1/documents")
        .set("Authorization", `Bearer ${accessToken}`);

      const docId = listRes.body.data.find((d: any) => d.type === "PASSPORT")?.id;

      const response = await request(app)
        .get(`/api/v1/documents/${docId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.type).toBe("PASSPORT");
    });

    it("should reject accessing another student's document", async () => {
      const otherEmail = `other.doc.${Date.now()}@example.com`;
      const otherRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "Other",
          lastName: "Doc",
          phoneNumber: "254700000088",
          email: otherEmail,
          dateOfBirth: "2000-01-01",
          nationality: "Kenyan",
          idNumber: "ID88888888",
          idType: "NATIONAL_ID",
          institution: "Test University",
          course: "CS",
          password: "TestPass123!",
          confirmPassword: "TestPass123!",
          termsAccepted: true,
        });

      await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${otherRes.body.data.accessToken}`)
        .field("type", "STUDENT_ID")
        .attach("file", Buffer.from("fake"), "student_id.pdf");

      const otherList = await request(app)
        .get("/api/v1/documents")
        .set("Authorization", `Bearer ${otherRes.body.data.accessToken}`);

      const otherDocId = otherList.body.data[0]?.id;

      const response = await request(app)
        .get(`/api/v1/documents/${otherDocId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/v1/documents/stats", () => {
    it("should return document statistics", async () => {
      const response = await request(app)
        .get("/api/v1/documents/stats")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("total");
      expect(response.body.data).toHaveProperty("approved");
      expect(response.body.data).toHaveProperty("pending");
    });
  });

  describe("DELETE /api/v1/documents/:id", () => {
    it("should delete a document", async () => {
      const listRes = await request(app)
        .get("/api/v1/documents")
        .set("Authorization", `Bearer ${accessToken}`);

      const docId = listRes.body.data[0]?.id;

      const response = await request(app)
        .delete(`/api/v1/documents/${docId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
