import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

// NOTE: saveTestResult() was REMOVED as a security hardening measure.
// All test results are now saved exclusively server-side via /api/exam/submit (Admin SDK).
// The client-side Firestore SDK cannot write to the `results` collection per Firestore rules.

// NOTE: updateUserSubscription() was REMOVED as a security hardening measure.
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
  try {
    // SECURITY (VULN-03): Use server-side endpoint instead of client-side Firestore writes
    const { authenticatedFetch } = await import("./api");
    const res = await authenticatedFetch("/api/ai/save-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, messages }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.chatId || null;
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
