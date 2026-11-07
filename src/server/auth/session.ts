import "server-only";

import type { Route } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "./index";

/**
 * Data Access Layer de autenticación.
 * Toda comprobación de permisos pasa por aquí — nunca se confía en el cliente
 * ni únicamente en el `proxy.ts` (que solo hace comprobaciones optimistas).
 */

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

/** Lee la sesión una sola vez por request (memoizado con `React.cache`). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { id, name, email, role } = session.user;
  return { id, name, email, role: role === "ADMIN" ? "ADMIN" : "USER" };
});

/** Exige un usuario autenticado; si no lo hay, redirige al login conservando el destino. */
export async function requireUser(returnTo?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    const next = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    redirect(`/ingresar${next}` as Route);
  }
  return user;
}

/** Exige rol ADMIN. Para los demás la ruta simplemente "no existe". */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") notFound();
  return user;
}
