import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/dev/make-institute
 * 
 * TEMPORARY DEV ROUTE: Automatically registers the currently logged-in user 
 * as an Institute Owner so they can bypass manual Firebase setup for testing.
 */
export async function GET(request: Request) {
  // 1. Ensure user is logged in
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return NextResponse.json({ error: "You must be logged in as a normal student first. Go to /login, sign in, then come back to this URL." }, { status: 401 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const uid = authResult.uid;

    // 2. Check if they already own an institute
    const snapshot = await adminDb
      .collection("institutes")
      .where("ownerUid", "==", uid)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif; padding: 40px; text-align:center;">
          <h2 style="color: #4f46e5;">You already have an institute!</h2>
          <p>You can go to the login page now.</p>
          <a href="/institute/login" style="display:inline-block; padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:8px; font-weight:bold;">Go to Institute Login</a>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // 3. Create the dummy institute profile
    const newInstitute = {
      ownerUid: uid,
      name: "Demo Institute",
      plan: "coaching",
      maxAttempts: 5000,
      usedAttempts: 0,
      createdAt: new Date().toISOString()
    };

    await adminDb.collection("institutes").add(newInstitute);

    // 4. Return success page
    return new NextResponse(
      `<html><body style="font-family:sans-serif; padding: 40px; text-align:center;">
        <h2 style="color: #16a34a;">Success! 🎉</h2>
        <p>Your account was successfully upgraded to an Institute Owner.</p>
        <p><strong>Institute Name:</strong> Demo Institute</p>
        <br/>
        <a href="/institute/login" style="display:inline-block; padding:10px 20px; background:#16a34a; color:white; text-decoration:none; border-radius:8px; font-weight:bold;">Go to Institute Login</a>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );

  } catch (error) {
    console.error("[dev/make-institute] Error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
