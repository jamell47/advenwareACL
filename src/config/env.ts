import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  baseUrl: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  darajaConsumerKey: string;
  darajaConsumerSecret: string;
  darajaShortcode: string;
  darajaPasskey: string;
  darajaCallbackUrl: string;
  darajaEnvironment: string;
  storageEndpoint: string;
  storageAccessKey: string;
  storageSecretKey: string;
  storageBucket: string;
  uploadMaxSizeMb: number;
  whatsappSupportNumber: string;
  supportEmail: string;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || fallback!;
}

export const env: EnvConfig = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: parseInt(getEnv("PORT", "4000"), 10),
  baseUrl: getEnv("BASE_URL", "http://localhost:4000"),
  databaseUrl: getEnv("DATABASE_URL"),
  jwtSecret: getEnv("JWT_SECRET"),
  jwtRefreshSecret: getEnv("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: getEnv("JWT_ACCESS_EXPIRES_IN", "1h"),
  jwtRefreshExpiresIn: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
  darajaConsumerKey: getEnv("DARAJA_CONSUMER_KEY", ""),
  darajaConsumerSecret: getEnv("DARAJA_CONSUMER_SECRET", ""),
  darajaShortcode: getEnv("DARAJA_SHORTCODE", ""),
  darajaPasskey: getEnv("DARAJA_PASSKEY", ""),
  darajaCallbackUrl: getEnv("DARAJA_CALLBACK_URL", "http://localhost:4000/api/v1/payments/callback"),
  darajaEnvironment: getEnv("DARAJA_ENVIRONMENT", "sandbox"),
  storageEndpoint: getEnv("STORAGE_ENDPOINT", ""),
  storageAccessKey: getEnv("STORAGE_ACCESS_KEY", ""),
  storageSecretKey: getEnv("STORAGE_SECRET_KEY", ""),
  storageBucket: getEnv("STORAGE_BUCKET", ""),
  uploadMaxSizeMb: parseInt(getEnv("UPLOAD_MAX_SIZE_MB", "10"), 10),
  whatsappSupportNumber: getEnv("WHATSAPP_SUPPORT_NUMBER", ""),
  supportEmail: getEnv("SUPPORT_EMAIL", "support@advenwarecareer.link"),
  corsOrigin: getEnv("CORS_ORIGIN", "http://localhost:5173,http://localhost:3000,http://localhost:4000,https://advenwareacl.onrender.com"),
  rateLimitWindowMs: parseInt(getEnv("RATE_LIMIT_WINDOW_MS", "900000"), 10),
  rateLimitMax: parseInt(getEnv("RATE_LIMIT_MAX", "100"), 10),
};
