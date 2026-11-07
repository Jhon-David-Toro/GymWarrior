import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Comprobación optimista: si no hay cookie de sesión, redirige al login antes de renderizar.
 * NO es la barrera de seguridad — cada página y Server Action vuelve a validar la sesión
 * en el servidor (ver `src/server/auth/session.ts`).
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/ingresar";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/cuenta/:path*", "/admin/:path*"],
};
