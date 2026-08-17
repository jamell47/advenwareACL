import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "../src/routes";
import { errorHandler, notFound } from "../src/middleware/errorHandler";
import { env } from "../src/config/env";
import { setupSwagger } from "../src/config/swagger";

export function createTestApp() {
  const app = express();

  app.use(
    cors({
      origin: "*",
      credentials: true,
    }),
  );
  app.use(helmet());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.get("/", (req, res) => {
    res.json({ success: true, message: "ACL API Test Server" });
  });

  app.use("/api/v1", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export function generateTestToken(payload: {
  userId: string;
  email: string;
  role: string;
}): string {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    { ...payload, type: "access" },
    env.jwtSecret,
    { expiresIn: "1h" },
  );
}

export function generateTestRefreshToken(payload: {
  userId: string;
  email: string;
  role: string;
}): string {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    { ...payload, type: "refresh" },
    env.jwtRefreshSecret,
    { expiresIn: "7d" },
  );
}

export const TEST_USER = {
  email: "test.student@example.com",
  password: "TestPass123!",
  firstName: "Test",
  lastName: "Student",
  phoneNumber: "254700000001",
  dateOfBirth: new Date("2000-01-01"),
  nationality: "Kenyan",
  idNumber: "ID12345678",
  idType: "NATIONAL_ID" as const,
  institution: "Test University",
  course: "Computer Science",
};

export const TEST_USER_2 = {
  email: "test.student2@example.com",
  password: "TestPass456!",
  firstName: "Test2",
  lastName: "Student",
  phoneNumber: "254700000002",
  dateOfBirth: new Date("2000-02-02"),
  nationality: "Kenyan",
  idNumber: "ID87654321",
  idType: "NATIONAL_ID" as const,
  institution: "Test University",
  course: "Computer Science",
};
