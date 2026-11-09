import "server-only";

import { headers } from "next/headers";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

type RateLimitSuccess = {
  ok: true;
};

type RateLimitFailure = {
  ok: false;
  retryAfterSec: number;
};

type RateLimitResult = RateLimitSuccess | RateLimitFailure;

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
const DEFAULT_WINDOW_MS = 60_000;

/**
 * Extracts client IP address from request headers
 * @returns Client IP address or 'unknown'
 */
export async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const realIp = requestHeaders.get("x-real-ip");

  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  return realIp ?? "unknown";
}

/**
 * Cleans expired buckets from memory
 * @param currentTime - Current timestamp
 */
function cleanExpiredBuckets(currentTime: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= currentTime) {
      buckets.delete(key);
    }
  }
}

/**
 * Creates new rate limit bucket
 * @param key - Bucket identifier
 * @param currentTime - Current timestamp
 * @param windowMs - Time window in milliseconds
 */
function createBucket(key: string, currentTime: number, windowMs: number) {
  if (buckets.size >= MAX_BUCKETS) {
    cleanExpiredBuckets(currentTime);
  }

  buckets.set(key, {
    count: 1,
    resetAt: currentTime + windowMs,
  });
}

/**
 * Checks if bucket has exceeded rate limit
 * @param bucket - Rate limit bucket
 * @param limit - Maximum allowed requests
 * @param currentTime - Current timestamp
 * @returns Rate limit result
 */
function checkBucketLimit(bucket: Bucket, limit: number, currentTime: number): RateLimitResult {
  if (bucket.count >= limit) {
    const retryAfterMs = bucket.resetAt - currentTime;
    return {
      ok: false,
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

/**
 * Consumes rate limit for given key
 * @param key - Unique identifier for rate limit bucket
 * @param config - Rate limit configuration
 * @returns Rate limit result indicating success or retry time
 */
export function consumeRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const currentTime = Date.now();
  const bucket = buckets.get(key);

  const isBucketExpired = !bucket || bucket.resetAt <= currentTime;
  if (isBucketExpired) {
    createBucket(key, currentTime, config.windowMs);
    return { ok: true };
  }

  return checkBucketLimit(bucket, config.limit, currentTime);
}

/**
 * Rate limits by action and client IP address
 * @param action - Action identifier
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export async function rateLimitByIp(
  action: string,
  limit: number,
  windowMs = DEFAULT_WINDOW_MS,
): Promise<RateLimitResult> {
  const clientIp = await getClientIp();
  const key = `${action}:${clientIp}`;

  return consumeRateLimit(key, { limit, windowMs });
}
