import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/admin-audit";
import { parseBodyWithLimit } from "@/lib/body-limit";

/**
 * POST /api/admin/create-promo-code
 * Creates a promo/referral code in Firestore via Admin SDK.
 * Body: { code: string, creator?: string }
 */
export async function POST(request: Request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  if (await isRateLimited(`admin:${authResult.uid}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const body = await parseBodyWithLimit(request, '128kb');
    if (body instanceof NextResponse) return body;
    const { code, creator, ownerEmail } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing promo code." }, { status: 400 });
    }

    const codeId = code.trim().toUpperCase().replace(/\s+/g, "");
    if (codeId.length < 2 || codeId.length > 30) {
      return NextResponse.json({ error: "Code must be 2-30 characters." }, { status: 400 });
    }

    // Check if code already exists
    const existing = await adminDb.collection("promo_codes").doc(codeId).get();
    if (existing.exists) {
      return NextResponse.json({ error: "This code already exists." }, { status: 409 });
    }

    await adminDb.collection("promo_codes").doc(codeId).set({
      active: true,
      creator: creator || codeId,
      ownerEmail: ownerEmail ? ownerEmail.trim().toLowerCase() : null,
      createdAt: new Date().toISOString(),
      maxUses: 500,      // Limit total referrals per code
      currentUses: 0,    // Atomically incremented on each use
    });

    const link = `https://abhyascore.com/register?ref=${codeId}`;

    // Audit log
    logAdminAction({
      adminUid: authResult.uid,
      action: "create_promo_code",
      details: { code: codeId, creator: creator || codeId, ownerEmail: ownerEmail || null, link },
    });

    return NextResponse.json({
      success: true,
      code: codeId,
      link,
      message: `Code ${codeId} created successfully!`,
    });
  } catch (err: any) {
    console.error("[admin/create-promo-code] Error:", err);
    return NextResponse.json({ error: "Failed to create promo code." }, { status: 500 });
  }
}
