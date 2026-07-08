// One-time script to create an institute account
const admin = require("firebase-admin");

// Load the service account key from env
require("dotenv").config({ path: ".env.local" });

const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!encoded) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local");
  process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();
const auth = admin.auth();

async function createInstitute() {
  // Step 1: Create Firebase Auth user
  const email = "admin@abhyascore.com";
  const password = "Institute@123";

  let uid;
  try {
    const existingUser = await auth.getUserByEmail(email);
    uid = existingUser.uid;
    console.log(`User already exists: ${uid}`);
  } catch {
    const newUser = await auth.createUser({
      email,
      password,
      displayName: "AbhyasCore Institute",
      emailVerified: true,
    });
    uid = newUser.uid;
    console.log(`Created new user: ${uid}`);
  }

  // Step 2: Check if institute already exists
  const existing = await db.collection("institutes").where("ownerUid", "==", uid).limit(1).get();
  if (!existing.empty) {
    console.log("Institute already exists for this user!");
    console.log("Institute ID:", existing.docs[0].id);
  } else {
    // Step 3: Create institute document
    const doc = await db.collection("institutes").add({
      ownerUid: uid,
      name: "AbhyasCore Institute",
      plan: "coaching",
      maxAttempts: 5000,
      usedAttempts: 0,
      createdAt: new Date().toISOString(),
    });
    console.log("Institute created! ID:", doc.id);
  }

  console.log("\n=== LOGIN CREDENTIALS ===");
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`URL:      https://www.abhyascore.com/institute/login`);
  console.log("========================\n");
}

createInstitute().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
