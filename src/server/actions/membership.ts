"use server";

import { and, eq, gt } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";

import { type ActionState } from "@/lib/action-result";
import { formatDate } from "@/lib/format";
import { getCurrentUser } from "@/server/auth/session";
import { db, schema } from "@/server/db";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Activa un plan para el usuario actual.
 * El pago está simulado (proyecto de portafolio); aquí iría la integración con la pasarela
 * (p. ej. Wompi o Mercado Pago) y la activación vía webhook.
 */
export async function subscribeToPlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Inicia sesión para inscribirte en un plan." };

  const parsed = z.object({ planId: z.string().min(1) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: "Plan inválido." };

  const plan = await db.query.plan.findFirst({
    where: and(eq(schema.plan.id, parsed.data.planId), eq(schema.plan.isActive, true)),
  });
  if (!plan) return { status: "error", message: "Ese plan ya no está disponible." };

  const now = new Date();
  const active = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, user.id),
      eq(schema.membership.status, "ACTIVE"),
      gt(schema.membership.endsAt, now),
    ),
  });
  if (active) {
    return {
      status: "error",
      message: `Ya tienes un plan activo hasta el ${formatDate(active.endsAt)}.`,
    };
  }

  await db.insert(schema.membership).values({
    userId: user.id,
    planId: plan.id,
    pricePaid: plan.price,
    startsAt: now,
    endsAt: new Date(now.getTime() + plan.durationDays * DAY_MS),
  });

  refresh();
  return { status: "success", message: `¡Listo! Tu plan ${plan.name} está activo.` };
}
