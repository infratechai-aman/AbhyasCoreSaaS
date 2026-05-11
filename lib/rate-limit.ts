import { adminDb } from "@/lib/firebase-admin";

/**
 * In-memory rate limiter for serverless functions.
 *
 * ARCHITECTURAL NOTE: This is instance-scoped — each serverless cold start
 * gets a fresh Map. This is acceptable for initial scale (up to ~5,000 CCU)
 * but should be replaced with Upstash Redis or Vercel KV for distributed
 * rate limiting when scaling beyond that threshold.
 *
 * Hardened with a max cache size to prevent unbounded memory growth.
 */
const rateLimitCache = new Map<string, number[]>();
const MAX_CACHE_SIZE = 10_000; // Prevent memory exhaustion

export async function isRateLimited(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  
  // Evict oldest entries if cache grows too large (prevents memory leak)
  if (rateLimitCache.size > MAX_CACHE_SIZE) {
    const keysToDelete = Array.from(rateLimitCache.keys()).slice(0, Math.floor(MAX_CACHE_SIZE * 0.2));
    for (const k of keysToDelete) {
      rateLimitCache.delete(k);
    }
  }

  // Clean up expired entries periodically (1% chance per request)
  if (Math.random() < 0.01) {
    for (const [k, timestamps] of rateLimitCache.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        rateLimitCache.delete(k);
      } else {
        rateLimitCache.set(k, valid);
      }
    }
  }

  const timestamps = (rateLimitCache.get(safeKey) || []).filter(t => now - t < windowMs);
  
  if (timestamps.length >= maxRequests) {
    return true; // BLOCKED
  }
  
  timestamps.push(now);
  rateLimitCache.set(safeKey, timestamps);
  
  return false; // ALLOWED
}

