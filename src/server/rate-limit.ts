import "server-only";

import { headers } from "next/headers";

/**
 * Rate limiter de ventana fija en memoria.
 *
 * Suficiente para una sola instancia (desarrollo o un servidor). En un despliegue con
 * varias instancias o serverless, reemplázalo por un almacén compartido (p. ej. Redis/Upstash)
 * manteniendo la misma firma.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export async function getClientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export function consumeRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const };
  }

  if (bucket.count >= limit) {
    return { ok: false as const, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true as const };
}

/** Atajo: limita por acción + IP del cliente. */
export async function rateLimitByIp(action: string, limit: number, windowMs = 60_000) {
  const ip = await getClientIp();
  return consumeRateLimit(`${action}:${ip}`, { limit, windowMs });
}
