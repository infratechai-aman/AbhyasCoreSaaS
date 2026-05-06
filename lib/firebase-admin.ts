import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

function initAdmin() {
  if (adminApp) return;

  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!encoded) {
    console.error("[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY is not set.");
    return;
  }

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const serviceAccount = JSON.parse(decoded);

    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } else {
      adminApp = getApps()[0];
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
  } catch (err) {
    console.error("[firebase-admin] Failed to initialize:", err);
  }
}

// Initialize on module load
initAdmin();

export { adminAuth, adminDb };
