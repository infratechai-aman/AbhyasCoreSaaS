import { NextResponse } from "next/server";
import { sampleQuestion } from "@/lib/data";
import { requireAuth } from "@/lib/auth-middleware";

export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  return NextResponse.json({
    testId: "mock-jee-001",
    questions: Array.from({ length: 10 }).map((_, index) => ({
      ...sampleQuestion,
      id: `${sampleQuestion.id}-${index + 1}`
    }))
  });
}
