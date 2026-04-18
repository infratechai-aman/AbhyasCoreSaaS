import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = body.question;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are AbhyasCore AI, an elite, highly engaging, and slightly witty JEE/NEET tutor. Your goal is to make learning incredibly fun, immersive, and memorable for the student. Use bolding, bullet points, numbering, and Markdown formatting heavily to structure your answers beautifully (like ChatGPT or Gemini). If they ask you for a quiz, generate a brutal, rapid-fire exam. Use analogies, a touch of humor, and clear step-by-step logic."
        },
        { role: "user", content: prompt }
      ]
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
