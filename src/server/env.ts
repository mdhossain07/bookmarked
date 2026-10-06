import "server-only";
import { z } from "zod";

// Empty strings count as unset, so `KEY=` in a .env file behaves like a missing key.
const optional = z
  .string()
  .optional()
  .transform((value) => value || undefined);

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z
    .string({ required_error: "is required" })
    .regex(/^mongodb(\+srv)?:\/\//, "must start with mongodb:// or mongodb+srv://"),
  JWT_SECRET: z
    .string({ required_error: "is required" })
    .min(32, "must be at least 32 characters"),
  OPENAI_API_KEY: optional,
  OPENAI_MODEL: optional.transform((value) => value ?? "gpt-4o"),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

/** Validated environment, parsed on first use so a bad value fails the request instead of the import. */
export function env(): Env {
  if (cached) return cached;

  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.join(".")} ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment variables: ${problems}`);
  }

  cached = result.data;
  return cached;
}
