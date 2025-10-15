// Database types
export * from "./database/user";
export * from "./database/media";
export * from "./database/genre";
export * from "./database/movie";
export * from "./database/book";

// API types
export * from "./api/auth";
export * from "./api/media";
export * from "./api/movie";
export * from "./api/book";
export * from "./api/common";
export * from "./api/ai";

// Shared utilities
export * from "./shared/pagination";
export * from "./shared/validation";
export * from "./shared/ai-validation";

// Re-export zod for convenience
export { z } from "zod";
