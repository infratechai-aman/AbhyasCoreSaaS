import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";

/**
 * POST /api/admin/users
 * Returns users from Firestore via Admin SDK with pagination.
 * Body: { limit?: number, offset?: number, search?: string }
 */
export async function POST(request: Request) {
  // 1. Admin auth check (server-side)
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  // 2. Rate limit
  if (await isRateLimited(`admin:${authResult.uid}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    // Parse optional pagination params from body
    let pageLimit = 100;
    let offset = 0;
    let search = "";

    try {
      const body = await request.json();
      pageLimit = Math.min(Math.max(Number(body.limit) || 100, 1), 500);
      offset = Math.max(Number(body.offset) || 0, 0);
      search = typeof body.search === "string" ? body.search.trim().toLowerCase() : "";
    } catch {
      // Empty body is fine — use defaults
    }

    // Fetch all users (Firestore doesn't support offset natively, so we paginate in memory)
    // For production at scale (>10k users), migrate to a cursor-based approach
    const snapshot = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    
    let allUsers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply search filter if provided
    if (search) {
      allUsers = allUsers.filter((u: any) =>
        (u.email || "").toLowerCase().includes(search) ||
        (u.name || "").toLowerCase().includes(search)
      );
    }

    const total = allUsers.length;
    const paginatedUsers = allUsers.slice(offset, offset + pageLimit);

    return NextResponse.json({
      users: paginatedUsers,
      total,
      limit: pageLimit,
      offset,
      hasMore: offset + pageLimit < total,
    });
  } catch (err: any) {
    console.error("[admin/users] Error:", err);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}
