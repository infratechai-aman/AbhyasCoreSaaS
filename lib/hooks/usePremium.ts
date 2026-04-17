"use client";

import { useAuth } from "@/lib/auth-context";
import { PLAN_LIMITS, type PlanType } from "@/lib/types";

/**
 * Returns the current ISO date string in YYYY-MM-DD format.
 */
function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Returns the current ISO week string (YYYY-Wxx).
 */
function getCurrentWeek(): string {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - oneJan.getTime()) / 86400000);
  const weekNumber = Math.ceil((days + oneJan.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
}

/**
 * Central hook for plan-based feature gating.
 *
 * Reads the user's subscription and usage data from the auth context
 * and returns boolean flags + limit values for every gated feature.
 */
export function usePremium() {
  const { userData } = useAuth();

  // ── Resolve the effective plan ──
  const subscription = userData?.subscription;
  let plan: PlanType = "Free";

  if (subscription) {
    // Check if trial has expired
    if (subscription.plan === "Pro Trial" && subscription.expiryDate) {
      const now = new Date();
      const expiry = new Date(subscription.expiryDate);
      if (now > expiry) {
        plan = "Free"; // Trial expired → downgrade
      } else {
        plan = "Pro Trial";
      }
    } else if (subscription.plan === "Pro Monthly" || subscription.plan === "Pro Yearly") {
      plan = subscription.plan;
    } else {
      plan = subscription.plan || "Free";
    }
  }

  const isPro = plan === "Pro Trial" || plan === "Pro Monthly" || plan === "Pro Yearly";
  const isTrial = plan === "Pro Trial";
  const isTrialExpired =
    subscription?.plan === "Pro Trial" &&
    subscription?.expiryDate &&
    new Date() > new Date(subscription.expiryDate);

  // ── Usage tracking ──
  const usage = userData?.usage;
  const today = getTodayISO();
  const currentWeek = getCurrentWeek();

  // Reset daily counters if the tracked day is stale
  const examsAttemptedToday =
    usage?.lastTrackedDate === today ? (usage?.examsAttemptedToday ?? 0) : 0;
  const aiTokensUsedToday =
    usage?.lastTrackedDate === today ? (usage?.aiTokensUsedToday ?? 0) : 0;
  const customExamsCreatedToday =
    usage?.lastTrackedDate === today ? (usage?.customExamsCreatedToday ?? 0) : 0;

  // Reset weekly counter if the tracked week is stale
  const customExamsCreatedWeek =
    usage?.lastTrackedWeek === currentWeek ? (usage?.customExamsCreatedWeek ?? 0) : 0;

  const completedExamIds: string[] = usage?.completedExamIds ?? [];

  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.Free;

  // ── Feature Gates ──
  const canAccessMarketPractice = limits.canAccessMarketPractice;
  const canAccessRepository = limits.canAccessRepository;

  const canAttemptExam = isPro || examsAttemptedToday < limits.examsPerDay;
  const remainingExamsToday = isPro
    ? Infinity
    : Math.max(0, limits.examsPerDay - examsAttemptedToday);

  const canRepeatExam = (examId: string) => {
    if (limits.canRepeatExams) return true;
    return !completedExamIds.includes(examId);
  };

  const canUseAITutor = aiTokensUsedToday < limits.aiTokensPerDay;
  const remainingAITokens = Math.max(0, limits.aiTokensPerDay - aiTokensUsedToday);

  const canUseCustomBuilder = isPro
    ? customExamsCreatedToday < limits.customExamsPerDay
    : customExamsCreatedWeek < limits.customExamsPerWeek;
  const remainingCustomExams = isPro
    ? Math.max(0, limits.customExamsPerDay - customExamsCreatedToday)
    : Math.max(0, limits.customExamsPerWeek - customExamsCreatedWeek);

  // Trial remaining days
  const trialDaysRemaining = (() => {
    if (!isTrial || !subscription?.expiryDate) return 0;
    const diff = new Date(subscription.expiryDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  })();

  return {
    plan,
    isPro,
    isTrial,
    isTrialExpired,
    trialDaysRemaining,

    // Feature gates
    canAccessMarketPractice,
    canAccessRepository,
    canAttemptExam,
    remainingExamsToday,
    canRepeatExam,
    canUseAITutor,
    remainingAITokens,
    canUseCustomBuilder,
    remainingCustomExams,

    // Limits for display
    limits,
    examsAttemptedToday,
    aiTokensUsedToday,
    completedExamIds,
  };
}
