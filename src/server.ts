import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { env } from "./config/env";
import { StorageService } from "./utils/storage.util";
import { SupportService } from "./services/support.service";

const PORT = env.port;

async function main() {
  StorageService.ensureUploadDir();

  try {
    await SupportService.updateSupportConfig({
      whatsappNumber: env.whatsappSupportNumber || "254116144095",
      supportEmail: env.supportEmail,
    });
  } catch (error) {
    console.log("Support config seed skipped:", (error as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  ADVENWARE CAREER LINK (ACL) API`);
    console.log(`  Environment: ${env.nodeEnv}`);
    console.log(`  Server: http://localhost:${PORT}`);
    console.log(`  API Docs: http://localhost:${PORT}/api/docs`);
    console.log(`  Health: http://localhost:${PORT}/health`);
    console.log(`========================================\n`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
