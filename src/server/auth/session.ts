import "server-only";

import type { Route } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "./index";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

/**
 * Normalizes user role to USER or ADMIN
 * @param role - Raw role from session
 * @returns Normalized role
 */
function normalizeRole(role: string): "USER" | "ADMIN" {
  return role === "ADMIN" ? "ADMIN" : "USER";
}

/**
 * Transforms session user to application user format
 * @param sessionUser - User from authentication session
 * @returns Normalized current user
 */
function transformSessionUser(sessionUser: {
  id: string;
  name: string;
  email: string;
  role: string | null | undefined;
}): CurrentUser {
  return {
    id: sessionUser.id,
    name: sessionUser.name,
    email: sessionUser.email,
    role: normalizeRole(sessionUser.role ?? "USER"),
  };
}

/**
 * Retrieves current authenticated user from session
 * @returns Current user or null if not authenticated
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  return transformSessionUser(session.user);
});

/**
 * Builds login redirect URL with return path
 * @param returnTo - Path to return to after login
 * @returns Login URL with next parameter
 */
function buildLoginUrl(returnTo?: string): Route {
  if (!returnTo) {
    return "/ingresar" as Route;
  }
  return `/ingresar?next=${encodeURIComponent(returnTo)}` as Route;
}

/**
 * Requires authenticated user or redirects to login
 * @param returnTo - Path to return to after login
 * @returns Authenticated current user
 */
export async function requireUser(returnTo?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginUrl(returnTo));
  }

  return user;
}

/**
 * Requires admin role or returns 404
 * @returns Authenticated admin user
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser("/admin");

  if (user.role !== "ADMIN") {
    notFound();
  }

  return user;
}
