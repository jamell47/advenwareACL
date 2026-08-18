"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const storage_util_1 = require("./utils/storage.util");
const support_service_1 = require("./services/support.service");
const PORT = env_1.env.port;
async function main() {
    storage_util_1.StorageService.ensureUploadDir();
    try {
        await support_service_1.SupportService.updateSupportConfig({
            whatsappNumber: env_1.env.whatsappSupportNumber || "254116144095",
            supportEmail: env_1.env.supportEmail,
        });
    }
    catch (error) {
        console.log("Support config seed skipped:", error.message);
    }
    app_1.default.listen(PORT, () => {
        console.log(`\n========================================`);
        console.log(`  ADVENWARE CAREER LINK (ACL) API`);
        console.log(`  Environment: ${env_1.env.nodeEnv}`);
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
//# sourceMappingURL=server.js.map