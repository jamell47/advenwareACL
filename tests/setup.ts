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
  try {
    await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
    const tables = await prisma.$queryRaw<{ name: string }[]>`
      SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE();
    `;
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`DELETE FROM \`${table.name}\``);
    }
    await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
  } catch (e) {
    console.warn("Cleanup skipped:", e);
  }
});
