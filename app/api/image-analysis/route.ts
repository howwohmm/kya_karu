import { NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

// Store for rate limiting
const rateLimits: Record<string, number[]> = {};

/**
 * Implements rate limiting for the API
 */
async function rateLimit(req: Request) {
  // Get client IP for rate limiting
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  
  // Initialize or cleanup old requests
  if (!rateLimits[ip]) {
    rateLimits[ip] = [];
  }
  
  // Remove requests outside the current window
  rateLimits[ip] = rateLimits[ip].filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );
  
  // Check if rate limit is exceeded
  if (rateLimits[ip].length >= MAX_REQUESTS_PER_WINDOW) {
    return {
      status: 429,
      response: NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    };
  }
  
  // Add current request to the log
  rateLimits[ip].push(now);
  
  return { status: 200 };
}

/**
 * Extracts base64 data from a data URL
 */
function extractBase64Data(dataUrl: string): string | null {
  // Check if it's a data URL
  if (!dataUrl.startsWith('data:')) {
    return null;
  }
  
  // Extract the base64 part
  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
    return null;
  }
  
  return parts[1];
}

/**
 * Creates a structured prompt for image analysis
 */
function createImageAnalysisPrompt(
  imageBase64: string, 
  userPrompt?: string, 
  category?: string
): string {
  const validCategories = ["meals", "entertainment", "fashion", "fitness", "travel", "books", "music"];
  
  return `
    ## INSTRUCTIONS

    You are the image analysis engine for "Everyday Magic", a personal assistant app.
    Analyze the provided image and generate insightful observations that can lead to personalized recommendations.

    ## USER CONTEXT
    ${userPrompt ? `User request: "${userPrompt}"` : "No specific request provided."}
    ${category ? `Focus on category: "${category}"` : ""}

    ## OUTPUT REQUIREMENTS

    * Provide a detailed analysis of the image content, focusing on relevant features
    * Structure your response with these sections:
      1. "main_subject": A clear description of the primary subject
      2. "details": Important details or elements visible in the image
      3. "context": The situation, environment, or context of the image
      4. "recommendation_ideas": 2-3 specific ideas for recommendations based on the image
    * If the image is related to a specific category (${validCategories.join(", ")}), mention it
    * Keep your analysis concise but comprehensive (150-200 words total)
    * Be observant but avoid making unfounded assumptions

    ## GOAL

    Help the user get personalized recommendations based on the visual content they've shared.
  `;
}

export async function POST(req: Request) {
  const rateLimitResult = await rateLimit(req);
  if (rateLimitResult.status !== 200) {
    return rateLimitResult.response;
  }

  try {
    // Extract data from request
    const { image, prompt, category } = await req.json();
    
    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }
    
    // Extract base64 image data
    const imageBase64 = extractBase64Data(image);
    if (!imageBase64) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    // Create the structured prompt for image analysis
    const analysisPrompt = createImageAnalysisPrompt(imageBase64, prompt, category);
    
    // Use Gemini model for image analysis
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-vision" });
    
    const result = await model.generateContent([
      analysisPrompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      }
    ]);
    
    const response = await result.response;
    const analysis = response.text();
    
    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Failed to process image", details: error.message },
      { status: 500 }
    );
  }
} 