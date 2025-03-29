import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";

// Initialize the API client with the server-side environment variable
const API_KEY = env.GEMINI_API_KEY;
export const genAI = new GoogleGenerativeAI(API_KEY);

// Helper function to retry a function a certain number of times
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 1) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 1.5);
  }
}

// Helper function to extract JSON from a text string
function extractJsonFromText(text: string): any {
  // Try various regex patterns to find JSON
  const patterns = [
    /\[\s*\{[\s\S]*\}\s*\]/g, // Array of objects
    /\{\s*"[\w]+"[\s\S]*\}/g, // Object
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.warn("Found potential JSON but failed to parse:", match[0]);
        // Continue to next pattern
      }
    }
  }
  
  throw new Error("Could not extract valid JSON from the response");
}

/**
 * Get category-specific instructions to enhance recommendations
 */
function getCategorySpecificInstructions(category?: string): string {
  if (!category) return "";
  
  const instructions: Record<string, string> = {
    meals: `
      * For meal recommendations, include cuisine type and approximate preparation time
      * Consider dietary preferences if mentioned in the request
      * Focus on dishes that match the sentiment/mood of the request
    `,
    entertainment: `
      * For entertainment recommendations, include genre and approximate duration
      * Mention platform availability where applicable (Netflix, Hulu, etc.)
      * Match the tone/mood of the content to the request
    `,
    fashion: `
      * For fashion recommendations, specify occasion suitability
      * Consider seasonality and weather conditions if applicable
      * Include styling tips or pairing suggestions
    `,
    fitness: `
      * For fitness recommendations, include intensity level and time requirement
      * Specify equipment needed (if any) or mention if bodyweight only
      * Consider experience level in recommendations
    `,
    travel: `
      * For travel recommendations, include location details and best season to visit
      * Mention approximate budget category (budget, mid-range, luxury)
      * Highlight unique experiences or attractions
    `,
    books: `
      * For book recommendations, include author and publication year
      * Mention genre and approximate reading time/length
      * Compare to similar well-known works where helpful
    `,
    music: `
      * For music recommendations, include artist and genre
      * Mention album or release year where relevant
      * Suggest specific occasions or moods when the music would be most enjoyable
    `,
  };
  
  return instructions[category] || "";
}

/**
 * Creates a structured JSON prompt for the AI model
 * @param userPrompt The user's request for recommendations
 * @param category Optional category to focus on
 * @returns A structured prompt that enforces JSON output
 */
export function createJsonPrompt(userPrompt: string, category?: string): string {
  // Define the expected response structure
  const exampleResponse = [
    {
      title: "Example Title Without Any Asterisks or Formatting",
      reasoning: "Example reasoning for this recommendation",
      category: category || "books"
    }
  ];

  // Define available categories
  const validCategories = ["meals", "entertainment", "fashion", "fitness", "travel", "books", "music"];
  
  // Get category-specific instructions
  const categoryInstructions = getCategorySpecificInstructions(category);

  // Build a more structured prompt
  return `
    ## INSTRUCTIONS

    You are the recommendation engine for "Everyday Magic", a personal assistant app. 
    Generate 3 high-quality personalized recommendations based on the user request.

    ## USER REQUEST

    "${userPrompt}"

    ## OUTPUT REQUIREMENTS

    * Response MUST be a valid JSON array containing exactly 3 recommendation objects
    * Each recommendation object MUST have these properties:
      - "title": A plain text title WITHOUT any Markdown formatting (no asterisks, no bold, no formatting characters)
      - "reasoning": Brief explanation (1-2 sentences) justifying the recommendation
      - "category": One of: ${validCategories.join(", ")}
    ${category ? `* Focus recommendations on the category: "${category}"` : ""}
    ${categoryInstructions}
    * DO NOT include any explanatory text outside the JSON array
    * DO NOT include any markdown formatting, especially no ** asterisks ** for emphasis
    * DO NOT include backticks or code blocks
    * NO formatting characters of any kind in the title field

    ## EXAMPLE OUTPUT FORMAT

    ${JSON.stringify(exampleResponse, null, 2)}

    ## IMPORTANT

    Your entire response must be ONLY the JSON array and nothing else.
    Never use asterisks, markdown, or HTML formatting in any field.
  `;
}

/**
 * Parses JSON from the model's response text
 * @param text The response text from the model
 * @returns Parsed JSON data
 */
function parseJsonFromResponse(text: string) {
  try {
    // First try parsing the entire response
    return JSON.parse(text);
  } catch (parseError) {
    console.warn("Failed to parse direct response, attempting to extract JSON");
    // Try to extract JSON from the text
    return extractJsonFromText(text);
  }
}

/**
 * Sanitizes recommendation data by removing unwanted markdown formatting
 */
function sanitizeRecommendations(data: any) {
  if (!data || !Array.isArray(data)) {
    return data;
  }
  
  return data.map(item => {
    if (!item) return item;
    
    // Create a new object to avoid mutating the original
    const sanitized = { ...item };
    
    // Clean title from markdown formatting
    if (typeof sanitized.title === 'string') {
      // Remove asterisks, backticks, and other markdown
      sanitized.title = sanitized.title
        .replace(/\*\*/g, '') // Remove double asterisks (bold)
        .replace(/\*/g, '')   // Remove single asterisks (italic)
        .replace(/`/g, '')    // Remove backticks
        .replace(/#{1,6}\s/g, ''); // Remove heading markers
    }
    
    // Clean reasoning from markdown formatting
    if (typeof sanitized.reasoning === 'string') {
      sanitized.reasoning = sanitized.reasoning
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/#{1,6}\s/g, '');
    }
    
    return sanitized;
  });
}

// Helper function to get recommendations
export async function getRecommendations(prompt: string, category?: string) {
  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Use the structured JSON prompt
    const structuredPrompt = createJsonPrompt(prompt, category);
    
    // Generate content with the model
    const result = await model.generateContent(structuredPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const parsedData = parseJsonFromResponse(text);
    
    // Sanitize the recommendations to remove any markdown
    return sanitizeRecommendations(parsedData);
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    throw error;
  }
} 