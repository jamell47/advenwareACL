import dotenv from "dotenv";
dotenv.config();

import { prisma } from "../src/config/prisma";

beforeAll(async () => {
  process.env.NODE_ENV = "test";
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  `;
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM ${table.tablename}`);
  }
});
