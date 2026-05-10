import { adminDb } from "@/lib/firebase-admin";

/**
 * Firestore-based sliding window rate limiter.
 * Uses transactions to prevent TOCTOU race conditions.
 */
export async function isRateLimited(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  if (!adminDb) {
    console.error("Firestore Admin DB not initialized for rate limiting.");
    return false; // Fail open if no DB to prevent blocking legitimate users during setup
  }

  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_"); // sanitize key for Firestore doc ID
  const docRef = adminDb.collection("rate_limits").doc(safeKey);
  const now = Date.now();

  try {
    const isBlocked = await adminDb.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(docRef);
      let timestamps: number[] = [];

      if (docSnap.exists) {
        const data = docSnap.data();
        if (data && Array.isArray(data.timestamps)) {
          timestamps = data.timestamps;
        }
      }

      // Remove timestamps outside the window
      timestamps = timestamps.filter((t) => now - t < windowMs);

      if (timestamps.length >= maxRequests) {
        return true; // BLOCKED
      }

      timestamps.push(now);
      
      // Atomic write inside transaction
      transaction.set(docRef, {
        timestamps,
        lastUpdated: new Date().toISOString()
      });

      return false; // ALLOWED
    });

    return isBlocked;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return false; // Fail open on error
  }
}
