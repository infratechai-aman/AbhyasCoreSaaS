import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = `Explain this student question in step-by-step JEE/NEET tutoring style. Keep the tone calm and precise: ${body.question}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    return NextResponse.json({
      explanation: completion.choices[0]?.message?.content ?? "No explanation generated."
    });
  } catch (error) {
    return NextResponse.json(
      { error: "AI tutor failed", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
