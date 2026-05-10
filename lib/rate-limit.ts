import { adminDb } from "@/lib/firebase-admin";

/**
 * Firestore-based sliding window rate limiter.
 * This prevents TOCTOU and works seamlessly across serverless instances.
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
    const docSnap = await docRef.get();
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
    
    // Update Firestore
    await docRef.set({
      timestamps,
      lastUpdated: new Date().toISOString()
    });

    return false; // ALLOWED
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return false; // Fail open on error
  }
}
