"use server";

import { type ActionState, fromZodError } from "@/lib/action-result";
import { contactSchema } from "@/lib/validations";
import { db, schema } from "@/server/db";
import { rateLimitByIp } from "@/server/rate-limit";

export async function sendContactMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = await rateLimitByIp("contact", 3, 10 * 60_000);
  if (!limit.ok) {
    return { status: "error", message: "Ya recibimos tus mensajes. Inténtalo más tarde." };
  }

  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZodError(parsed.error, formData);

  // Si el honeypot viene lleno, respondemos "éxito" sin guardar nada.
  if (!parsed.data.website) {
    const { name, email, message } = parsed.data;
    await db.insert(schema.contactMessage).values({ name, email, message });
  }

  return {
    status: "success",
    message: "Mensaje enviado. Te respondemos en menos de 24 horas hábiles.",
  };
}
