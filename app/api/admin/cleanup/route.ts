import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/admin/cleanup
 * SECURITY (VULN-10): Cleans up stale exam_sessions to prevent database unbounded growth.
 * Can be triggered via Admin Dashboard or a scheduled Cron job.
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate (only admins or secure cron)
    const authResult = await requireAdmin(req);
    // Allow cron jobs with secret bearer token
    const isCron = req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
    
    if (authResult instanceof NextResponse && !isCron) {
      return authResult; // Unauthorized
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Server not configured." }, { status: 500 });
    }

    // Delete sessions older than 24 hours (createdAt is stored as ISO string)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const oldSessionsQuery = await adminDb
      .collection("exam_sessions")
      .where("createdAt", "<", oneDayAgo)
      .limit(500)
      .get();

    if (oldSessionsQuery.empty) {
      return NextResponse.json({ message: "No stale sessions found.", deleted: 0 });
    }

    const batch = adminDb.batch();
    oldSessionsQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return NextResponse.json({ 
      message: `Successfully deleted ${oldSessionsQuery.size} stale exam sessions.`,
      deleted: oldSessionsQuery.size 
    });
  } catch (err: any) {
    console.error("[admin/cleanup] Error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
