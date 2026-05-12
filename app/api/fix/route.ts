import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  if (!adminDb) return NextResponse.json({ error: "no db" }, { status: 500 });
  try {
    const codeId = "SAMIYA'SVLOGS";
    await adminDb.collection("promo_codes").doc(codeId).set({
      ownerEmail: "samiya@abhyascore.com"
    }, { merge: true });
    
    // Also try without quote just in case
    await adminDb.collection("promo_codes").doc("SAMIYASVLOGS").set({
      ownerEmail: "samiya@abhyascore.com"
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
