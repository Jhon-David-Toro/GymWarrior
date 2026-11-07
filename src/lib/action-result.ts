import type { z } from "zod";

/**
 * Forma estándar de respuesta de las Server Actions.
 * Permite mostrar errores por campo y un mensaje general sin lanzar excepciones al cliente.
 */
export type ActionState<TData = undefined> =
  | { status: "idle" }
  | { status: "success"; message?: string; data?: TData }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
      /** Valores enviados, para no vaciar el formulario tras un error. */
      values?: Record<string, string>;
    };

export const idle = { status: "idle" } as const;

export function fromZodError(error: z.ZodError, formData?: FormData): ActionState<never> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return {
    status: "error",
    message: "Revisa los campos marcados.",
    fieldErrors,
    values: formData ? formDataToStrings(formData) : undefined,
  };
}

export function formDataToStrings(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.toLowerCase().includes("password")) values[key] = value;
  }
  return values;
}
