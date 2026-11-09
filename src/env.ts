import { z } from "zod";

import { MIN_AUTH_SECRET_LENGTH } from "./lib/constants";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().default("postgresql://localhost:5432/gymwarrior"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(MIN_AUTH_SECRET_LENGTH)
    .default("dev-secret-change-in-production-min-32-chars"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

/**
 * Formats validation errors into readable messages
 * @param error - Zod validation error
 * @returns Formatted error messages
 */
function formatIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`).join("\n");
}

/**
 * Parses and validates server environment variables
 * @returns Validated server environment
 */
function parseServerEnv() {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    console.warn("Environment validation warnings:");
    console.warn(formatIssues(parsed.error));
    console.warn("Using default values for development. Set proper values in production.");
  }

  return parsed.success ? parsed.data : serverSchema.parse({});
}

/**
 * Server-only environment variables. Do not use in client components.
 * @returns Server environment configuration
 */
export const serverEnv = () => parseServerEnv();

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
