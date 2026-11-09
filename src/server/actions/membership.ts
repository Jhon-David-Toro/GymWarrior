"use server";

import { and, eq, gt } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";

import { type ActionState } from "@/lib/action-result";
import { formatDate } from "@/lib/format";
import { getCurrentUser } from "@/server/auth/session";
import { db, schema } from "@/server/db";

const DAY_MS = 24 * 60 * 60 * 1000;

const ERROR_MESSAGES = {
  UNAUTHORIZED: "Inicia sesión para inscribirte en un plan.",
  INVALID_PLAN: "Plan inválido.",
  PLAN_UNAVAILABLE: "Ese plan ya no está disponible.",
} as const;

const planIdSchema = z.object({ planId: z.string().min(1) });

/**
 * Fetches active plan by ID
 * @param planId - Plan identifier
 * @returns Plan or undefined if not found or inactive
 */
async function getActivePlan(planId: string) {
  return db.query.plan.findFirst({
    where: and(eq(schema.plan.id, planId), eq(schema.plan.isActive, true)),
  });
}

/**
 * Fetches user's active membership
 * @param userId - User identifier
 * @param currentDate - Current date for comparison
 * @returns Active membership or undefined
 */
async function getActiveMembership(userId: string, currentDate: Date) {
  return db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, userId),
      eq(schema.membership.status, "ACTIVE"),
      gt(schema.membership.endsAt, currentDate),
    ),
  });
}

/**
 * Creates active membership error message
 * @param endDate - Membership end date
 * @returns Formatted error message
 */
function createActiveMembershipError(endDate: Date): ActionState {
  return {
    status: "error",
    message: `Ya tienes un plan activo hasta el ${formatDate(endDate)}.`,
  };
}

/**
 * Calculates membership end date
 * @param startDate - Membership start date
 * @param durationDays - Plan duration in days
 * @returns Calculated end date
 */
function calculateEndDate(startDate: Date, durationDays: number): Date {
  return new Date(startDate.getTime() + durationDays * DAY_MS);
}

/**
 * Creates membership record
 * @param userId - User identifier
 * @param planId - Plan identifier
 * @param pricePaid - Price paid for plan
 * @param startDate - Membership start date
 * @param endDate - Membership end date
 */
async function createMembership(
  userId: string,
  planId: string,
  pricePaid: number,
  startDate: Date,
  endDate: Date,
) {
  await db.insert(schema.membership).values({
    userId,
    planId,
    pricePaid,
    startsAt: startDate,
    endsAt: endDate,
  });
}

/**
 * Activates subscription plan for current user
 * @param _prev - Previous action state (unused)
 * @param formData - Form data containing plan ID
 * @returns Action state with success or error message
 */
export async function subscribeToPlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: ERROR_MESSAGES.UNAUTHORIZED };
  }

  const parsed = planIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: ERROR_MESSAGES.INVALID_PLAN };
  }

  const plan = await getActivePlan(parsed.data.planId);
  if (!plan) {
    return { status: "error", message: ERROR_MESSAGES.PLAN_UNAVAILABLE };
  }

  const now = new Date();
  const activeMembership = await getActiveMembership(user.id, now);
  if (activeMembership) {
    return createActiveMembershipError(activeMembership.endsAt);
  }

  const endDate = calculateEndDate(now, plan.durationDays);
  await createMembership(user.id, plan.id, plan.price, now, endDate);

  refresh();
  return { status: "success", message: `¡Listo! Tu plan ${plan.name} está activo.` };
}
