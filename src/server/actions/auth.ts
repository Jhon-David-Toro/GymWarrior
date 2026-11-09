"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { type ActionState, formDataToStrings, fromZodError } from "@/lib/action-result";
import { safeRedirectPath } from "@/lib/utils";
import { signInSchema, signUpSchema } from "@/lib/validations";
import { auth } from "@/server/auth";
import { rateLimitByIp } from "@/server/rate-limit";

const SIGN_IN_LIMIT = 5;
const SIGN_UP_LIMIT = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;

/**
 * Creates rate limit error state
 * @param retryAfterSec - Seconds until retry is allowed
 * @param formData - Form data to preserve in error state
 * @returns Error action state with retry message
 */
const createRateLimitError = (retryAfterSec: number, formData: FormData): ActionState => ({
  status: "error",
  message: `Demasiados intentos. Vuelve a intentarlo en ${retryAfterSec} segundos.`,
  values: formDataToStrings(formData),
});

/**
 * Creates authentication error state
 * @param formData - Form data to preserve in error state
 * @returns Error action state with authentication failure message
 */
const createAuthError = (formData: FormData): ActionState => ({
  status: "error",
  message: "El correo o la contraseña no son correctos.",
  values: formDataToStrings(formData),
});

/**
 * Creates user already exists error state
 * @param formData - Form data to preserve in error state
 * @returns Error action state with field-specific error
 */
const createUserExistsError = (formData: FormData): ActionState => ({
  status: "error",
  message: "Revisa los campos marcados.",
  fieldErrors: { email: ["Ya existe una cuenta con este correo. Inicia sesión."] },
  values: formDataToStrings(formData),
});

/**
 * Creates generic sign up error state
 * @param formData - Form data to preserve in error state
 * @returns Error action state with generic failure message
 */
const createSignUpError = (formData: FormData): ActionState => ({
  status: "error",
  message: "No pudimos crear tu cuenta. Inténtalo de nuevo.",
  values: formDataToStrings(formData),
});

/**
 * Authenticates user with email and password
 * @param _prev - Previous action state (unused)
 * @param formData - Form data containing email and password
 * @returns Action state or redirects on success
 */
export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const limit = await rateLimitByIp("sign-in", SIGN_IN_LIMIT, RATE_LIMIT_WINDOW_MS);
  if (!limit.ok) {
    return createRateLimitError(limit.retryAfterSec, formData);
  }

  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fromZodError(parsed.error, formData);
  }

  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    if (isAPIError(error)) {
      return createAuthError(formData);
    }
    throw error;
  }

  redirect(safeRedirectPath(formData.get("next")));
}

/**
 * Registers new user account
 * @param _prev - Previous action state (unused)
 * @param formData - Form data containing name, email and password
 * @returns Action state or redirects on success
 */
export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const limit = await rateLimitByIp("sign-up", SIGN_UP_LIMIT, RATE_LIMIT_WINDOW_MS);
  if (!limit.ok) {
    return createRateLimitError(limit.retryAfterSec, formData);
  }

  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fromZodError(parsed.error, formData);
  }

  const { name, email, password } = parsed.data;
  try {
    await auth.api.signUpEmail({ body: { name, email, password }, headers: await headers() });
  } catch (error) {
    if (isAPIError(error)) {
      const isUserExists = error.body?.code?.startsWith("USER_ALREADY_EXISTS") ?? false;
      return isUserExists ? createUserExistsError(formData) : createSignUpError(formData);
    }
    throw error;
  }

  redirect(safeRedirectPath(formData.get("next"), "/cuenta?bienvenida=1"));
}

/**
 * Signs out current user and redirects to home
 */
export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
