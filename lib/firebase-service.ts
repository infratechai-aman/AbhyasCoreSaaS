import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";

export async function saveTestResult(userId: string, payload: any) {
  try {
    // 1. Save results to the 'results' collection
    const resultsRef = collection(db, "results");
    const resultDoc = await addDoc(resultsRef, {
      userId,
      ...payload,
      timestamp: serverTimestamp(),
    });

    // 2. Update user aggregates
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      mocksCompleted: increment(1),
      questionsSolved: increment(payload.totalQuestions || 0),
      // Logic for streak and performance index can be added here or via Cloud Functions
    });

    return resultDoc.id;
  } catch (error) {
    console.error("Error saving test result:", error);
    throw error;
  }
}
