import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { config } from "./config/environment";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { ApiResponse, HttpStatus } from "bookmarked-types";

// Create Express application
const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use("/api/", limiter);
// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parsing middleware
app.use(cookieParser());

// Compression middleware
app.use(compression() as any);

// Logging middleware
if (config.app.isDevelopment) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Welcome endpoint
app.get("/", (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: "Welcome to Bookmarked API",
    data: {
      name: config.app.name,
      version: config.app.version,
      environment: config.app.env,
      documentation: "/api/docs", // TODO: Add API documentation
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

// 404 handler for undefined routes
app.use("*", notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
