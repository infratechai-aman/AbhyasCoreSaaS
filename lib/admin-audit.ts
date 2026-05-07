import { adminDb } from "@/lib/firebase-admin";

/**
 * Log an admin action to Firestore for audit trail.
 * Fire-and-forget — errors are logged but don't block the request.
 */
export async function logAdminAction(params: {
  adminUid: string;
  action: string;
  targetUserId?: string;
  details?: Record<string, any>;
}) {
  if (!adminDb) return;

  try {
    await adminDb.collection("admin_audit_log").add({
      adminUid: params.adminUid,
      action: params.action,
      targetUserId: params.targetUserId || null,
      details: params.details || {},
      timestamp: new Date().toISOString(),
      ip: "server-side", // Next.js doesn't easily expose client IP in API routes
    });
  } catch (err) {
    console.error("[audit] Failed to log admin action:", err);
  }
}
