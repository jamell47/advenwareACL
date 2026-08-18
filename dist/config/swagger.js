"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./env");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ADVENWARE CAREER LINK (ACL) API",
            version: "1.0.0",
            description: `
# ADVENWARE CAREER LINK (ACL) API

Student Attachment Placement Platform API

## Base URL
\`\${BASE_URL}/api/v1\`

## Authentication
Use Bearer JWT tokens for authenticated endpoints.

## Contact
- Email: ${env_1.env.supportEmail}
- WhatsApp: ${env_1.env.whatsappSupportNumber}
      `,
            contact: {
                name: "ADVENWARE",
                email: env_1.env.supportEmail,
            },
        },
        servers: [
            {
                url: `${env_1.env.baseUrl}/api/v1`,
                description: `${env_1.env.nodeEnv} server`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./src/routes/*.ts"],
};
const spec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(spec));
    app.get("/api-docs.json", (req, res) => {
        res.json(spec);
    });
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map