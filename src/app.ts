import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import routes from "./routes";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { authenticate } from "./middleware/auth";
import { morganMiddleware } from "./config/logger";
import { setupSwagger } from "./config/swagger";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = env.corsOrigin
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      console.log("CORS Origin:", origin);
      console.log("Allowed Origins:", allowedOrigins);

      if (!origin || origin === "null") {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`Blocked CORS origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(morganMiddleware);

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    error: { code: "RATE_LIMIT_EXCEEDED" },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ADVENWARE CAREER LINK (ACL) API",
    version: "1.0.0",
    docs: "/api/docs",
    status: "running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", routes);

setupSwagger(app);

app.use(notFound);
app.use(errorHandler);

export default app;
