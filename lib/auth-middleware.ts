import { adminAuth } from "./firebase-admin";
import { NextResponse } from "next/server";

// SECURITY (VULN-13): No hardcoded fallback — require env var
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();

export interface AuthenticatedUser {
  uid: string;
  email: string;
}

/**
 * Verify Firebase ID token from Authorization header.
 * Returns the decoded user (uid + email) or null.
 * Rejects unverified email accounts (MEDIUM-04).
 */
export async function verifyAuthToken(
  request: Request
): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.slice(7);
    if (!adminAuth) {
      console.error("[auth-middleware] Admin Auth not initialized");
      return null;
    }

    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.uid || !decoded.email) return null;

    // MEDIUM-04: Enforce email verification for all non-admin users
    if (!decoded.email_verified && decoded.email.toLowerCase() !== ADMIN_EMAIL) {
      return null;
    }

    return { uid: decoded.uid, email: decoded.email };
  } catch (err) {
    console.error("[auth-middleware] Token verification failed:", err);
    return null;
  }
}

/**
 * Require authentication. Returns 401 response if not authenticated.
 */
export async function requireAuth(
  request: Request
): Promise<AuthenticatedUser | NextResponse> {
  const user = await verifyAuthToken(request);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }
  return user;
}

/**
 * Require admin authentication. Returns 403 if not admin.
 */
export async function requireAdmin(
  request: Request
): Promise<AuthenticatedUser | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (result.email.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json(
      { error: "Forbidden. Admin access only." },
      { status: 403 }
    );
  }
  return result;
}
