import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/admin/cleanup
 * 
 * Cleans up expired exam sessions from Firestore to prevent unbounded collection growth.
 * Designed to be called by Vercel Cron Jobs.
 * 
 * Setup: Add to vercel.json → crons: [{ path: "/api/admin/cleanup", schedule: "0 2 * * *" }]
 */
export async function POST(req: Request) {
  try {
    // Verify this is a cron job or admin request
    const isCron = req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
    
    if (!isCron) {
      // Fall back to admin auth check
      const { requireAdmin } = await import("@/lib/auth-middleware");
      const authResult = await requireAdmin(req);
      if (authResult instanceof NextResponse) return authResult;
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Server not configured." }, { status: 500 });
    }

    const now = new Date().toISOString();
    let deletedSessions = 0;
    let deletedWebhookEvents = 0;

    // 1. Delete expired exam sessions (expiresAt < now)
    const expiredSessions = await adminDb
      .collection("exam_sessions")
      .where("expiresAt", "<", now)
      .limit(500) // Process in batches to avoid timeout
      .get();

    if (!expiredSessions.empty) {
      const batch = adminDb.batch();
      expiredSessions.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedSessions = expiredSessions.size;
    }

    // 2. Delete old webhook events (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const oldWebhookEvents = await adminDb
      .collection("webhook_events")
      .where("processedAt", "<", thirtyDaysAgo)
      .limit(500)
      .get();

    if (!oldWebhookEvents.empty) {
      const batch = adminDb.batch();
      oldWebhookEvents.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedWebhookEvents = oldWebhookEvents.size;
    }

    console.info(`[cleanup] Deleted ${deletedSessions} expired sessions, ${deletedWebhookEvents} old webhook events`);

    return NextResponse.json({
      success: true,
      deletedSessions,
      deletedWebhookEvents,
      timestamp: now,
    });
  } catch (err: any) {
    console.error("[admin/cleanup] Error:", err);
    return NextResponse.json({ error: "Cleanup failed." }, { status: 500 });
  }
}
