import { adminDb } from "./firebase-admin";
import { NextResponse } from "next/server";
import type { AuthenticatedUser } from "./auth-middleware";

/**
 * Plan types and their server-side limits.
 * Mirrors lib/types.ts PLAN_LIMITS but enforced server-side.
 */
const SERVER_PLAN_LIMITS = {
  Free: {
    aiTutorAllowed: true,
    aiTokensPerDay: 10_000,
    examsPerDay: 1,
    customExamsPerDay: 1,
    customExamsPerWeek: 1,
  },
  "Pro Trial": {
    aiTutorAllowed: true,
    aiTokensPerDay: 40_000,
    examsPerDay: Infinity,
    customExamsPerDay: 5,
    customExamsPerWeek: 35,
  },
  "Pro Monthly": {
    aiTutorAllowed: true,
    aiTokensPerDay: 40_000,
    examsPerDay: Infinity,
    customExamsPerDay: 5,
    customExamsPerWeek: 35,
  },
  "Pro Yearly": {
    aiTutorAllowed: true,
    aiTokensPerDay: 40_000,
    examsPerDay: Infinity,
    customExamsPerDay: 5,
    customExamsPerWeek: 35,
  },
  "Weekly Pass": {
    aiTutorAllowed: true,
    aiTokensPerDay: 40_000,
    examsPerDay: Infinity,
    customExamsPerDay: 5,
    customExamsPerWeek: 35,
  },
} as const;

type PlanName = keyof typeof SERVER_PLAN_LIMITS;

export interface UserSubscriptionInfo {
  plan: PlanName;
  isPro: boolean;
  limits: (typeof SERVER_PLAN_LIMITS)[PlanName];
  usage: {
    examsAttemptedToday: number;
    aiTokensUsedToday: number;
    customExamsCreatedToday: number;
    customExamsCreatedWeek: number;
    lastTrackedDate: string;
    lastTrackedWeek: string;
  };
}

/** Get today's ISO date string */
function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Get current ISO week string */
function getCurrentWeek(): string {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - oneJan.getTime()) / 86_400_000
  );
  const weekNumber = Math.ceil((days + oneJan.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
}

/**
 * Fetch the user's subscription plan from Firestore (server-side).
 * Handles Weekly Pass expiry: if the pass has expired, auto-downgrades.
 */
export async function getUserSubscription(
  user: AuthenticatedUser
): Promise<UserSubscriptionInfo | null> {
  if (!adminDb) {
    console.error("[subscription-middleware] Admin DB not initialized");
    return null;
  }

  try {
    const userRef = adminDb.collection("users").doc(user.uid);
    const snap = await userRef.get();

    if (!snap.exists) {
      return {
        plan: "Free",
        isPro: false,
        limits: SERVER_PLAN_LIMITS.Free,
        usage: {
          examsAttemptedToday: 0,
          aiTokensUsedToday: 0,
          customExamsCreatedToday: 0,
          customExamsCreatedWeek: 0,
          lastTrackedDate: "",
          lastTrackedWeek: "",
        },
      };
    }

    const data = snap.data()!;
    const subscription = data.subscription || {};
    let plan: PlanName = "Free";

    if (subscription.status === "active" && subscription.plan) {
      // Check Weekly Pass expiry
      if (subscription.plan === "Weekly Pass" && subscription.expiryDate) {
        const now = new Date();
        const expiry = new Date(subscription.expiryDate);
        if (now > expiry) {
          // Auto-downgrade expired Weekly Pass
          await userRef.update({
            "subscription.plan": "Free",
            "subscription.status": "none",
            "subscription.expiredAt": new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          plan = "Free";
        } else {
          plan = "Weekly Pass";
        }
      } else if (subscription.plan === "Pro Trial" && subscription.expiryDate) {
        const now = new Date();
        const expiry = new Date(subscription.expiryDate);
        if (now > expiry) {
          plan = "Free";
        } else {
          plan = "Pro Trial";
        }
      } else if (
        subscription.plan === "Pro Monthly" ||
        subscription.plan === "Pro Yearly" ||
        subscription.plan === "Weekly Pass"
      ) {
        plan = subscription.plan;
      }
    }

    const isPro =
      plan === "Pro Trial" ||
      plan === "Pro Monthly" ||
      plan === "Pro Yearly" ||
      plan === "Weekly Pass";

    const limits = SERVER_PLAN_LIMITS[plan] || SERVER_PLAN_LIMITS.Free;

    // Parse usage with daily/weekly reset logic
    const usage = data.usage || {};
    const today = getTodayISO();
    const currentWeek = getCurrentWeek();
    const isNewDay = usage.lastTrackedDate !== today;
    const isNewWeek = usage.lastTrackedWeek !== currentWeek;

    return {
      plan,
      isPro,
      limits,
      usage: {
        examsAttemptedToday: isNewDay ? 0 : usage.examsAttemptedToday || 0,
        aiTokensUsedToday: isNewDay ? 0 : usage.aiTokensUsedToday || 0,
        customExamsCreatedToday: isNewDay
          ? 0
          : usage.customExamsCreatedToday || 0,
        customExamsCreatedWeek: isNewWeek
          ? 0
          : usage.customExamsCreatedWeek || 0,
        lastTrackedDate: today,
        lastTrackedWeek: currentWeek,
      },
    };
  } catch (err) {
    console.error("[subscription-middleware] Error:", err);
    return null;
  }
}

/**
 * Require at least a Pro subscription. Returns 403 if free user.
 */
export async function requirePro(
  user: AuthenticatedUser
): Promise<UserSubscriptionInfo | NextResponse> {
  const sub = await getUserSubscription(user);
  if (!sub) {
    return NextResponse.json(
      { error: "Server error checking subscription." },
      { status: 500 }
    );
  }
  if (!sub.isPro) {
    return NextResponse.json(
      { error: "This feature requires a Pro subscription." },
      { status: 403 }
    );
  }
  return sub;
}

/**
 * Check if the user can attempt an exam (enforces daily limit for free users).
 */
export async function checkExamAccess(
  user: AuthenticatedUser
): Promise<UserSubscriptionInfo | NextResponse> {
  const sub = await getUserSubscription(user);
  if (!sub) {
    return NextResponse.json(
      { error: "Server error checking subscription." },
      { status: 500 }
    );
  }

  if (!sub.isPro && sub.usage.examsAttemptedToday >= sub.limits.examsPerDay) {
    return NextResponse.json(
      {
        error: `Daily exam limit reached (${sub.limits.examsPerDay}/day on Free plan). Upgrade to Pro for unlimited exams.`,
        limitReached: true,
      },
      { status: 403 }
    );
  }

  return sub;
}
