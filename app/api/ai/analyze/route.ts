import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { requireAuth } from "@/lib/auth-middleware";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // 1. Authenticate
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  // 2. Rate limit: 10 requests per minute per user
  if (isRateLimited(`analyze:${authResult.uid}`, 10, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();

  // Validate input size
  const bodyStr = JSON.stringify(body);
  if (bodyStr.length > 50000) {
    return NextResponse.json({ error: "Input too large." }, { status: 400 });
  }

  const prompt = `You are an expert JEE/NEET performance coach. Analyze this result data and return JSON with keys summary, weakChapters, suggestions: ${bodyStr}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
