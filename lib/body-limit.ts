/**
 * Request body size validation for API routes.
 * Prevents memory exhaustion from oversized payloads on serverless functions.
 *
 * Usage in API routes:
 *   const body = await parseBodyWithLimit(request, '1mb');
 *   if (body instanceof NextResponse) return body;
 */
import { NextResponse } from "next/server";

const SIZE_MAP: Record<string, number> = {
  "256kb": 256 * 1024,
  "512kb": 512 * 1024,
  "1mb": 1 * 1024 * 1024,
  "2mb": 2 * 1024 * 1024,
  "5mb": 5 * 1024 * 1024,
};

/**
 * Parse and validate request body size.
 * Returns parsed JSON body if within limit, or a 413 NextResponse if too large.
 */
export async function parseBodyWithLimit(
  request: Request,
  maxSize: string = "1mb"
): Promise<any | NextResponse> {
  const limit = SIZE_MAP[maxSize] || 1 * 1024 * 1024;

  // Check Content-Length header first (fast path)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > limit) {
    return NextResponse.json(
      { error: `Request body too large. Maximum size: ${maxSize}.` },
      { status: 413 }
    );
  }

  try {
    const text = await request.text();
    if (text.length > limit) {
      return NextResponse.json(
        { error: `Request body too large. Maximum size: ${maxSize}.` },
        { status: 413 }
      );
    }
    return JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
