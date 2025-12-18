import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import { config } from "./config/environment.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import bookRoutes from "./routes/book.routes.js";
import openAIRoutes from "./routes/openAI.route.js";
import { ApiResponse, HttpStatus } from "bookmarked-types";

// Create Express application
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use("/api/movies", movieRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/openai", openAIRoutes);

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
