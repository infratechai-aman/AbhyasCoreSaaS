import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/auth/logout
 * 
 * Server-side logout: revokes all refresh tokens for the user,
 * ensuring tokens from other devices are also invalidated.
 */
export async function POST(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    if (adminAuth) {
      await adminAuth.revokeRefreshTokens(authResult.uid);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth/logout] Error:", error);
    return NextResponse.json({ success: true }); // Don't block logout on error
  }
}
