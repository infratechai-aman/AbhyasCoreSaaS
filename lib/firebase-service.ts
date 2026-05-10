import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
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

    // Tier unlock logic — use 75% correct threshold (works for any exam size)
    if (payload.chapterId && payload.chapterId.startsWith('tiered_')) {
      const questionsCount = payload.totalQuestions || payload.questions?.length || 0;
      const threshold = Math.ceil(questionsCount * 0.75);
      if (payload.correctCount >= threshold && questionsCount > 0) {
        const tierMatch = payload.chapterId.split('_')[1];
        if (tierMatch) {
           const passedTier = parseInt(tierMatch, 10);
           const currentMax = userData.maxTierPassed || 0;
           if (passedTier > currentMax) {
              updates.maxTierPassed = passedTier;
           }
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
// NOTE: updateUserSubscription was removed as a security hardening measure.
// All subscription writes now happen exclusively via Firebase Admin SDK
// in the server-side payment/verify and payment/webhook routes.


export async function getUserTestHistory(userId: string, limitCount: number = 50) {
  if (!db) return [];
  try {
    const resultsRef = collection(db, "results");
    const q = query(
      resultsRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
}

export async function getTestResultById(docId: string) {
  if (!db) return null;
  try {
    const docRef = doc(db, "results", docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching single result:", error);
    return null;
  }
}

export async function saveAITutorChat(userId: string, title: string, messages: any[]) {
  if (!db) return null;
  try {
    // MEDIUM-33: Cap message history to prevent unbounded document growth
    const MAX_MESSAGES = 50;
    const MAX_CONTENT_LENGTH = 10000;
    const cappedMessages = messages.slice(-MAX_MESSAGES).map((m: any) => ({
      role: typeof m.role === "string" ? m.role : "user",
      content: typeof m.content === "string" ? m.content.slice(0, MAX_CONTENT_LENGTH) : "",
    }));

    const chatsRef = collection(db, "ai_chats");
    const chatDoc = await addDoc(chatsRef, {
      userId,
      title: typeof title === "string" ? title.slice(0, 200) : "Chat",
      messages: cappedMessages,
      timestamp: serverTimestamp()
    });
    return chatDoc.id;
  } catch (error) {
    console.error("Error saving AI chat:", error);
    return null;
  }
}

export async function getAITutorHistory(userId: string) {
  if (!db) return [];
  try {
    const chatsRef = collection(db, "ai_chats");
    const q = query(
      chatsRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching AI history:", error);
    return [];
  }
}
