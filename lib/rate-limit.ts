import { adminDb } from "@/lib/firebase-admin";

// SECURITY & OPTIMIZATION: Use in-memory LRU-style rate limiter instead of Firestore.
// This saves 1 Read + 1 Write per API request, drastically reducing Firebase costs.
// In a serverless environment, this is instance-scoped (loose limit), but sufficient for DoS protection.
const rateLimitCache = new Map<string, number[]>();

export async function isRateLimited(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  
  // Clean up old entries periodically to prevent memory leaks in long-running instances
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
