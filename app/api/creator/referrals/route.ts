import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/creator/referrals
 * Fetches referral statistics for the currently logged-in creator.
 */
export async function GET(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const userEmail = authResult.email.toLowerCase();

    // 1. Find if the user owns any promo code
    const codesSnapshot = await adminDb
      .collection("promo_codes")
      .where("ownerEmail", "==", userEmail)
      .limit(1)
      .get();

    if (codesSnapshot.empty) {
      return NextResponse.json(
        { isCreator: false, message: "No promo codes assigned to this account." },
        { status: 404 }
      );
    }

    const codeDoc = codesSnapshot.docs[0];
    const codeId = codeDoc.id;
    const codeData = codeDoc.data();

    // 2. Find all users referred by this code (sort in memory to avoid needing a Firestore composite index)
    const usersSnapshot = await adminDb
      .collection("users")
      .where("referredBy", "==", codeId)
      .get();

    const referredUsers = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        createdAt: data.createdAt,
        subscription: data.subscription,
      };
    });

    // Sort by createdAt descending
    referredUsers.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    // 3. Calculate stats + finance
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // "2026-05-12"
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalSignups = referredUsers.length;
    let paidConversions = 0;
    let totalRevenue = 0;
    let signupsToday = 0;
    let signupsThisWeek = 0;
    let signupsThisMonth = 0;

    // Plan pricing map (in ₹)
    const planPricing: Record<string, number> = {
      "Pro Monthly": 49,
      "Pro Yearly": 399,
      "Pro Weekly": 7,
    };
    
    // Process recent signups (masking emails for privacy)
    const recentSignups = referredUsers.map((user) => {
      const isPaid = user.subscription?.status === "active" && user.subscription?.plan && user.subscription.plan !== "Free";
      if (isPaid) {
        paidConversions++;
        const planName = user.subscription?.plan || "";
        totalRevenue += planPricing[planName] || 49; // default to ₹49 if unknown
      }

      // Time-based counts
      const createdDate = new Date(user.createdAt || 0);
      if (user.createdAt && user.createdAt.startsWith(todayStr)) signupsToday++;
      if (createdDate >= weekAgo) signupsThisWeek++;
      if (createdDate >= monthAgo) signupsThisMonth++;

      // Mask email: a***@gmail.com
      const emailParts = user.email ? user.email.split("@") : ["unknown", "unknown"];
      const maskedEmail = emailParts[0].length > 1 
        ? `${emailParts[0].charAt(0)}***@${emailParts[1]}` 
        : `***@${emailParts[1]}`;

      return {
        id: user.id,
        maskedEmail,
        createdAt: user.createdAt,
        isPaid,
        plan: user.subscription?.plan || "Free",
      };
    });

    const conversionRate = totalSignups > 0 ? ((paidConversions / totalSignups) * 100).toFixed(1) : "0.0";
    const creatorEarnings = Math.round(totalRevenue * 0.40); // 40% commission

    return NextResponse.json({
      success: true,
      isCreator: true,
      data: {
        codeId,
        active: codeData.active,
        totalSignups,
        paidConversions,
        conversionRate,
        // Finance
        totalRevenue,
        creatorEarnings,
        // Time-based referrals
        signupsToday,
        signupsThisWeek,
        signupsThisMonth,
        recentSignups: recentSignups.slice(0, 50),
      }
    });

  } catch (err: any) {
    console.error("[creator/referrals] Error:", err);
    return NextResponse.json({ error: "Failed to fetch referral data." }, { status: 500 });
  }
}
