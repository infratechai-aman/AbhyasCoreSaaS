import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
import { isRateLimited } from "@/lib/rate-limit";

/**
 * POST /api/admin/verify
 * Returns whether the authenticated user is an admin.
 * This keeps the admin email server-side only.
 */
export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    // SECURITY (VULN-24): Rate limit to prevent enumeration
    if (await isRateLimited(`admin-verify:${authResult.uid}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const isAdmin = authResult.email.toLowerCase() === ADMIN_EMAIL;
    return NextResponse.json({ isAdmin });
  } catch (err: any) {
    // SECURITY (VULN-25): Sanitize error message
    console.error("[admin/verify] Error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
