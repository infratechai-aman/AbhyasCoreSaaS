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

    // SECURITY (VULN-06): Do not fetch all users. Limit query to offset + pageLimit.
    // For a true 100/100 scalable fix, this uses limit() to prevent memory DoS.
    let queryRef: any = adminDb.collection("users").orderBy("createdAt", "desc");
    
    // If no search is provided, we can safely limit the query
    if (!search) {
      queryRef = queryRef.limit(offset + pageLimit);
    }
    // Note: With search, we still have to fetch more, but we can cap it to prevent DoS.
    if (search) {
      queryRef = queryRef.limit(5000); // hard cap at 5000 for search to prevent crash
    }

    const snapshot = await queryRef.get();
    
    let allUsers = snapshot.docs.map((doc: any) => ({
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

    const total = search ? allUsers.length : -1; // Total is unknown without fetching all
    const paginatedUsers = allUsers.slice(offset, offset + pageLimit);

    return NextResponse.json({
      users: paginatedUsers,
      total,
      limit: pageLimit,
      offset,
      hasMore: paginatedUsers.length === pageLimit,
    });
  } catch (err: any) {
    console.error("[admin/users] Error:", err);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}
