import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!encoded) {
  console.error("No service account key");
  process.exit(1);
}

const decoded = Buffer.from(encoded, "base64").toString("utf-8");
const serviceAccount = JSON.parse(decoded);

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = getFirestore();

async function fix() {
  try {
    const codeId1 = "SAMIYA'SVLOGS";
    await db.collection("promo_codes").doc(codeId1).set({
      ownerEmail: "samiya@abhyascore.com"
    }, { merge: true });
    console.log("Updated", codeId1);

    const codeId2 = "SAMIYASVLOGS";
    await db.collection("promo_codes").doc(codeId2).set({
      ownerEmail: "samiya@abhyascore.com"
    }, { merge: true });
    console.log("Updated", codeId2);

    console.log("Done");
  } catch (err) {
    console.error(err);
  }
}

fix();
