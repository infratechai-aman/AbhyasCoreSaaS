import { NextResponse } from "next/server";
import { sampleQuestion } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    testId: "mock-jee-001",
    questions: Array.from({ length: 10 }).map((_, index) => ({
      ...sampleQuestion,
      id: `${sampleQuestion.id}-${index + 1}`
    }))
  });
}
