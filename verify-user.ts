import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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

const auth = getAuth();

async function fix() {
  try {
    const userRecord = await auth.getUserByEmail("samiya@abhyascore.com");
    await auth.updateUser(userRecord.uid, {
      emailVerified: true
    });
    console.log("Verified email for samiya@abhyascore.com");
  } catch (err) {
    console.error(err);
  }
}

fix();
