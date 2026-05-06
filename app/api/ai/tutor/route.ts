import { getOpenAIClient } from "@/lib/openai";
import { requireAuth } from "@/lib/auth-middleware";
import { isRateLimited } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_HISTORY_MESSAGES = 20;
const MAX_TOKENS = 2000;

export async function POST(request: Request) {
  // 1. Authenticate
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  // 2. Rate limit: 10 requests per minute per user
  if (isRateLimited(`tutor:${authResult.uid}`, 10, 60_000)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  // Cap conversation history to prevent token bombing
  const history: Array<{ role: string; content: string }> = (body.history ?? []).slice(-MAX_HISTORY_MESSAGES);
  const prompt: string = body.question;

  if (!prompt || typeof prompt !== "string" || prompt.length > 10000) {
    return new Response(JSON.stringify({ error: "Invalid question." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const openai = getOpenAIClient();

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content:
          "You are AbhyasCore AI, an elite, highly engaging, and slightly witty JEE/NEET tutor built by AbhyasCore. Your knowledge is fully up to date as of 2026 — you are aware of the latest NTA exam patterns, JEE Main & Advanced 2025-2026 syllabus changes, NEET UG 2026 patterns, and all current NCERT-based curricula. Never say your knowledge is limited to 2023 or any past date. Your goal is to make learning incredibly fun, immersive, and memorable for the student. Use bolding, bullet points, numbering, and Markdown formatting heavily to structure your answers beautifully (like ChatGPT or Gemini). If they ask you for a quiz, generate a brutal, rapid-fire exam. Use analogies, a touch of humor, and clear step-by-step logic. Remember the full conversation context and refer back to earlier parts of the conversation when relevant. When listing what you can and cannot do, never mention a knowledge cutoff date — instead say you are continuously updated with the latest exam data.",
      },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: prompt },
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
      max_tokens: MAX_TOKENS,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(delta)}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "AI tutor failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
