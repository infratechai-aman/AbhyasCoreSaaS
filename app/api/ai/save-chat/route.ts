import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";

/**
 * POST /api/ai/save-chat
 * 
 * Server-side AI chat saving endpoint (replaces client-side Firestore writes).
 * SECURITY (VULN-03): Rate-limited and size-validated to prevent Firestore cost bomb.
 */
export async function POST(request: Request) {
  // 1. Authenticate
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  // 2. Rate limit: 20 saves per minute
  if (await isRateLimited(`save-chat:${authResult.uid}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { title, messages } = body;

    // Validate and cap inputs
    const MAX_MESSAGES = 50;
    const MAX_CONTENT_LENGTH = 10000;
    const MAX_TITLE_LENGTH = 200;

    const sanitizedTitle = typeof title === "string" ? title.slice(0, MAX_TITLE_LENGTH) : "Chat";

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages." }, { status: 400 });
    }

    const cappedMessages = messages.slice(-MAX_MESSAGES).map((m: any) => ({
      role: typeof m.role === "string" && (m.role === "user" || m.role === "assistant")
        ? m.role : "user",
      content: typeof m.content === "string" ? m.content.slice(0, MAX_CONTENT_LENGTH) : "",
    }));

    const { FieldValue } = await import("firebase-admin/firestore");

    const chatRef = await adminDb.collection("ai_chats").add({
      userId: authResult.uid,
      title: sanitizedTitle,
      messages: cappedMessages,
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ chatId: chatRef.id });
  } catch (error: any) {
    console.error("[ai/save-chat] Error:", error);
    return NextResponse.json({ error: "Failed to save chat." }, { status: 500 });
  }
}
