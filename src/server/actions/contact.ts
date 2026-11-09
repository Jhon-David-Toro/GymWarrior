"use server";

import { type ActionState, fromZodError } from "@/lib/action-result";
import { contactSchema } from "@/lib/validations";
import { db, schema } from "@/server/db";
import { rateLimitByIp } from "@/server/rate-limit";

const CONTACT_RATE_LIMIT = 3;
const CONTACT_WINDOW_MS = 10 * 60_000;

const ERROR_MESSAGES = {
  RATE_LIMIT: "Ya recibimos tus mensajes. Inténtalo más tarde.",
} as const;

const SUCCESS_MESSAGE = "Mensaje enviado. Te respondemos en menos de 24 horas hábiles.";

/**
 * Checks if honeypot field is filled (indicates bot)
 * @param website - Honeypot field value
 * @returns True if honeypot detected bot
 */
function isHoneypotFilled(website: unknown): boolean {
  return Boolean(website);
}

/**
 * Saves contact message to database
 * @param name - Contact name
 * @param email - Contact email
 * @param message - Contact message
 */
async function saveContactMessage(name: string, email: string, message: string) {
  await db.insert(schema.contactMessage).values({ name, email, message });
}

/**
 * Processes contact form submission with spam protection
 * @param _prev - Previous action state (unused)
 * @param formData - Form data with contact fields
 * @returns Action state with success or error message
 */
export async function sendContactMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = await rateLimitByIp("contact", CONTACT_RATE_LIMIT, CONTACT_WINDOW_MS);
  if (!limit.ok) {
    return { status: "error", message: ERROR_MESSAGES.RATE_LIMIT };
  }

  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fromZodError(parsed.error, formData);
  }

  if (!isHoneypotFilled(parsed.data.website)) {
    const { name, email, message } = parsed.data;
    await saveContactMessage(name, email, message);
  }

  return { status: "success", message: SUCCESS_MESSAGE };
}
