import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3001"),

  // Database
  MONGODB_URI: z.string().default("mongodb://localhost:27017/bookmarked"),
  MONGODB_TEST_URI: z
    .string()
    .default("mongodb://localhost:27017/bookmarked-test"),

  // Authentication
  JWT_SECRET: z.string().min(5, "JWT_SECRET must be at least 5 characters"),
  JWT_EXPIRES_IN: z.string().default("24h"),
  BCRYPT_ROUNDS: z.string().transform(Number).default("12"),

  // CORS
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:3000"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("100"),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
});

// Validate environment variables
const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error("❌ Invalid environment variables:");
  console.error(envResult.error.format());
  process.exit(1);
}

export const env = envResult.data;

// Derived configurations
export const config = {
  app: {
    name: "Bookmarked API",
    version: "1.0.0",
    env: env.NODE_ENV,
    port: env.PORT,
    isDevelopment: env.NODE_ENV === "development",
    isProduction: env.NODE_ENV === "production",
    isTest: env.NODE_ENV === "test",
  },

  database: {
    uri: env.NODE_ENV === "test" ? env.MONGODB_TEST_URI : env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    bcryptRounds: env.BCRYPT_ROUNDS,
  },

  cors: {
    origin: env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"] as string[],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
      "Pragma",
    ] as string[],
    exposedHeaders: ["Set-Cookie"] as string[],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: "Too many requests from this IP, please try again later.",
  },

  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    enabled: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
  },

  openAI: {
    apiKey: env.OPENAI_API_KEY,
  },
} as const;
