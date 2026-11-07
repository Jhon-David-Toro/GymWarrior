import { z } from "zod";

/**
 * Variables de entorno validadas al arrancar.
 * Si falta alguna o tiene un formato inválido, la app falla rápido con un mensaje claro
 * en lugar de romperse en tiempo de ejecución.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET debe tener al menos 32 caracteres"),
  BETTER_AUTH_URL: z.url(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

function formatIssues(error: z.ZodError) {
  return error.issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");
}

function parseServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`❌ Variables de entorno inválidas:\n${formatIssues(parsed.error)}`);
  }
  return parsed.data;
}

/** Solo usar en código de servidor. */
export const serverEnv = () => parseServerEnv();

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
