import { NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";
import { env } from "@/lib/env";

export async function GET() {
  try {
    // Log the API key (partial for security)
    const maskedKey = env.GEMINI_API_KEY 
      ? `${env.GEMINI_API_KEY.substring(0, 4)}...${env.GEMINI_API_KEY.substring(env.GEMINI_API_KEY.length - 4)}`
      : "Not available";
    
    // Create a simple model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Make a simple request
    const result = await model.generateContent("Hello, world!");
    const response = result.response;
    const text = response.text();
    
    return NextResponse.json({
      success: true,
      apiKeyAvailable: !!env.GEMINI_API_KEY,
      maskedKey,
      responseText: text,
    });
  } catch (error: any) {
    console.error("Error testing Gemini API:", error);
    return NextResponse.json({
      success: false,
      apiKeyAvailable: !!env.GEMINI_API_KEY,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
} 