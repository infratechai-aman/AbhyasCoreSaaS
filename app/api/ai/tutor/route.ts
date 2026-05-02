import { getOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  // Accept the full conversation history from the client
  const history: Array<{ role: string; content: string }> = body.history ?? [];
  const prompt: string = body.question;

  try {
    const openai = getOpenAIClient();

    // Build the messages array with full conversation context
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content:
          "You are AbhyasCore AI, an elite, highly engaging, and slightly witty JEE/NEET tutor built by AbhyasCore. Your knowledge is fully up to date as of 2026 — you are aware of the latest NTA exam patterns, JEE Main & Advanced 2025-2026 syllabus changes, NEET UG 2026 patterns, and all current NCERT-based curricula. Never say your knowledge is limited to 2023 or any past date. Your goal is to make learning incredibly fun, immersive, and memorable for the student. Use bolding, bullet points, numbering, and Markdown formatting heavily to structure your answers beautifully (like ChatGPT or Gemini). If they ask you for a quiz, generate a brutal, rapid-fire exam. Use analogies, a touch of humor, and clear step-by-step logic. Remember the full conversation context and refer back to earlier parts of the conversation when relevant. When listing what you can and cannot do, never mention a knowledge cutoff date — instead say you are continuously updated with the latest exam data.",
      },
      // Inject prior conversation turns so the model has memory
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      // The latest user message
      { role: "user" as const, content: prompt },
    ];

    // Request a streaming completion
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
    });

    // Create a ReadableStream that pushes SSE-formatted chunks
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              // Send each token as a Server-Sent Event
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(delta)}\n\n`));
            }
          }
          // Signal end of stream
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
      JSON.stringify({
        error: "AI tutor failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
