/**
 * In-memory token bucket rate limiter.
 *
 * Suitable for single-instance deployments. Each endpoint gets its own
 * bucket configuration. Buckets are keyed by IP address.
 *
 * Reference: security/rate-limiting-patterns.md
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed per window */
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

const buckets = new Map<string, Bucket>();

// Periodic cleanup: remove stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    // Remove buckets that haven't been used in 10 minutes
    if (now - bucket.lastRefill > 10 * 60 * 1000) {
      buckets.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Extract client IP from request headers.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP.trim();
  return '127.0.0.1';
}

/**
 * Check if a request is rate-limited.
 *
 * @param key - Unique key for the bucket (typically IP + endpoint)
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed and optionally when to retry
 */
// Skip rate limiting when disabled via env var
const DISABLED = import.meta.env.DEV || process.env.DISABLE_RATE_LIMIT === 'true';

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  if (DISABLED) return { allowed: true };
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: config.maxRequests, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refillRate = config.maxRequests / config.windowMs;
  bucket.tokens = Math.min(
    config.maxRequests,
    bucket.tokens + elapsed * refillRate,
  );
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true };
  }

  const retryAfter = Math.ceil((1 - bucket.tokens) / refillRate);
  return { allowed: false, retryAfter };
}

// ─── Pre-configured limiters ────────────────────────────────────────

/** Reviews: 3 per minute per IP (prevents spam) */
export function reviewLimiter(ip: string): RateLimitResult {
  return checkRateLimit(`review:${ip}`, {
    windowMs: 60_000,
    maxRequests: 3,
  });
}

/** Registration: 5 per hour per IP */
export function registroLimiter(ip: string): RateLimitResult {
  return checkRateLimit(`registro:${ip}`, {
    windowMs: 60 * 60_000,
    maxRequests: 5,
  });
}

/** Advertising contact: 2 per hour per IP */
export function publicidadLimiter(ip: string): RateLimitResult {
  return checkRateLimit(`publicidad:${ip}`, {
    windowMs: 60 * 60_000,
    maxRequests: 2,
  });
}
