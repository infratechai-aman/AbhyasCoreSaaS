import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = `You are an expert JEE/NEET performance coach. Analyze this result data and return JSON with keys summary, weakChapters, suggestions: ${JSON.stringify(body)}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }]
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    return NextResponse.json(
      { error: "AI analysis failed", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
