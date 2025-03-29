import { NextResponse } from "next/server";
import { createJsonPrompt, getRecommendations } from "@/lib/gemini";

// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const requestLog: Record<string, number[]> = {};

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  
  // Initialize or update request log
  if (!requestLog[ip]) {
    requestLog[ip] = [];
  }
  
  // Remove expired timestamps
  requestLog[ip] = requestLog[ip].filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  // Check if rate limited
  if (requestLog[ip].length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  // Add current request timestamp
  requestLog[ip].push(now);
  return false;
}

export async function POST(request: Request) {
  // Get client IP (in a real app, you'd handle this more robustly)
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  
  // Check rate limit
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }
  
  try {
    const body = await request.json();
    const { prompt, category } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    try {
      const data = await getRecommendations(prompt, category);
      return NextResponse.json({ recommendations: data });
    } catch (geminiError: any) {
      console.error("Gemini API error:", geminiError);
      // More specific error handling
      if (geminiError.message?.includes("API key")) {
        return NextResponse.json(
          { error: "API key configuration error" },
          { status: 500 }
        );
      } else if (geminiError.message?.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: geminiError.message || "Failed to get recommendations from AI service" },
          { status: 500 }
        );
      }
    }
  } catch (parseError) {
    console.error("Request parsing error:", parseError);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
} 