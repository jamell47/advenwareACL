import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { env } from "./env";

interface SwaggerOptions {
  definition: {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
      contact: { name: string; email: string };
    };
    servers: { url: string; description: string }[];
    components: { securitySchemes: any };
    security: any[];
  };
  apis: string[];
}

const options: SwaggerOptions = {
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
- Email: ${env.supportEmail}
- WhatsApp: ${env.whatsappSupportNumber}
      `,
      contact: {
        name: "ADVENWARE",
        email: env.supportEmail,
      },
    },
    servers: [
      {
        url: `${env.baseUrl}/api/v1`,
        description: `${env.nodeEnv} server`,
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

const spec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));
  app.get("/api-docs.json", (req, res) => {
    res.json(spec);
  });
};
