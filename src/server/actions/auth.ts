"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { type ActionState, formDataToStrings, fromZodError } from "@/lib/action-result";
import { safeRedirectPath } from "@/lib/utils";
import { signInSchema, signUpSchema } from "@/lib/validations";
import { auth } from "@/server/auth";
import { rateLimitByIp } from "@/server/rate-limit";

const tooMany = (retryAfterSec: number, formData: FormData): ActionState => ({
  status: "error",
  message: `Demasiados intentos. Vuelve a intentarlo en ${retryAfterSec} segundos.`,
  values: formDataToStrings(formData),
});

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const limit = await rateLimitByIp("sign-in", 5);
  if (!limit.ok) return tooMany(limit.retryAfterSec, formData);

  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZodError(parsed.error, formData);

  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    if (isAPIError(error)) {
      // Mensaje genérico: no revelamos si el correo existe.
      return {
        status: "error",
        message: "El correo o la contraseña no son correctos.",
        values: formDataToStrings(formData),
      };
    }
    throw error;
  }

  redirect(safeRedirectPath(formData.get("next")));
}

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const limit = await rateLimitByIp("sign-up", 3);
  if (!limit.ok) return tooMany(limit.retryAfterSec, formData);

  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZodError(parsed.error, formData);

  const { name, email, password } = parsed.data;
  try {
    await auth.api.signUpEmail({ body: { name, email, password }, headers: await headers() });
  } catch (error) {
    if (isAPIError(error)) {
      const exists = error.body?.code?.startsWith("USER_ALREADY_EXISTS");
      return {
        status: "error",
        message: exists
          ? "Revisa los campos marcados."
          : "No pudimos crear tu cuenta. Inténtalo de nuevo.",
        fieldErrors: exists
          ? { email: ["Ya existe una cuenta con este correo. Inicia sesión."] }
          : undefined,
        values: formDataToStrings(formData),
      };
    }
    throw error;
  }

  redirect(safeRedirectPath(formData.get("next"), "/cuenta?bienvenida=1"));
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
