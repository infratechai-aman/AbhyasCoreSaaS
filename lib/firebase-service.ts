import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  getDoc,
  arrayUnion
} from "firebase/firestore";
import { db } from "./firebase";

export async function saveTestResult(userId: string, payload: any) {
  if (!db) {
    console.warn("Firestore not available");
    return null;
  }

  try {
    // 1. Save results to the 'results' collection
    const resultsRef = collection(db, "results");
    const resultDoc = await addDoc(resultsRef, {
      userId,
      ...payload,
      timestamp: serverTimestamp(),
    });

    // 2. Update user aggregates and usage tracking
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};
    const usage = userData.usage || {};
    
    const today = new Date().toISOString().split("T")[0];
    const isNewDay = usage.lastTrackedDate !== today;

    // Calculate new usage values
    const examsAttemptedToday = isNewDay ? 1 : (usage.examsAttemptedToday || 0) + 1;
    const aiTokensUsedToday = isNewDay ? 0 : (usage.aiTokensUsedToday || 0);
    const customExamsCreatedToday = isNewDay ? 0 : (usage.customExamsCreatedToday || 0);

    const questionsCount = payload.totalQuestions || payload.questions?.length || 0;

    let updates: any = {
      mocksCompleted: increment(1),
      questionsSolved: increment(questionsCount),
      "usage.lastTrackedDate": today,
      "usage.examsAttemptedToday": examsAttemptedToday,
      "usage.aiTokensUsedToday": aiTokensUsedToday,
      "usage.customExamsCreatedToday": customExamsCreatedToday,
      "usage.completedExamIds": arrayUnion(payload.chapterId || "unknown_exam")
    };

    // Tier unlock logic
    if (payload.chapterId && payload.chapterId.startsWith('tiered_') && payload.correctCount >= 45) {
      const tierMatch = payload.chapterId.split('_')[1];
      if (tierMatch) {
         const passedTier = parseInt(tierMatch, 10);
         const currentMax = userData.maxTierPassed || 0;
         if (passedTier > currentMax) {
            updates.maxTierPassed = passedTier;
         }
      }
    }

    await updateDoc(userRef, updates);

    return resultDoc.id;
  } catch (error) {
    console.error("Error saving test result:", error);
    throw error;
  }
}
export async function updateUserSubscription(
  userId: string,
  plan: "Pro Monthly" | "Pro Yearly" | "Free",
  status: "active" | "canceled" | "past_due" | "none",
  razorpaySubscriptionId?: string
) {
  if (!db) return;

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    "subscription.plan": plan,
    "subscription.status": status,
    "subscription.razorpaySubscriptionId": razorpaySubscriptionId || null,
    updatedAt: serverTimestamp(),
  });
}
