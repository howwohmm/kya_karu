// Client-side API functions - browser friendly

/**
 * Removes markdown formatting from recommendation data
 */
function sanitizeRecommendationData(data: any): any {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeRecommendationData(item));
  }
  
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    
    for (const key in data) {
      if (key === 'title' || key === 'reasoning') {
        if (typeof data[key] === 'string') {
          // Remove markdown formatting
          cleaned[key] = data[key]
            .replace(/\*\*/g, '') // Remove bold
            .replace(/\*/g, '')   // Remove italic
            .replace(/`/g, '')    // Remove code
            .replace(/#{1,6}\s/g, ''); // Remove headings
        } else {
          cleaned[key] = data[key];
        }
      } else {
        cleaned[key] = data[key];
      }
    }
    
    return cleaned;
  }
  
  return data;
}

/**
 * Get recommendations based on a text prompt
 */
export async function getClientRecommendations(prompt: string, category?: string) {
  try {
    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, category }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch recommendations");
    }

    const data = await response.json();
    // The API now returns the recommendations data directly, not in a property
    const recommendations = Array.isArray(data) ? data : (data.recommendations || []);
    
    // Clean any remaining markdown formatting
    return sanitizeRecommendationData(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
}

/**
 * Converts a File to a base64 string for image processing
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Resizes an image to reduce size while maintaining aspect ratio
 */
export const resizeImage = async (
  base64: string, 
  maxWidth = 800, 
  maxHeight = 800
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * maxHeight / height);
          height = maxHeight;
        }
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
  });
};

/**
 * Process an image with the Gemini Vision model
 * @param imageBase64 Base64 encoded image
 * @param prompt Optional prompt to guide the analysis
 * @param category Optional category context
 * @returns Analysis data
 */
export async function processImage(
  imageBase64: string,
  prompt?: string,
  category?: string
): Promise<{ analysis: string }> {
  try {
    // Resize the image to reduce its size
    const resizedImage = await resizeImage(imageBase64);
    
    // Make a POST request to our API endpoint
    const response = await fetch('/api/image-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: resizedImage,
        prompt,
        category,
      }),
    });
    
    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process image');
    }
    
    // Get the response data
    const data = await response.json();
    
    // Parse the analysis response into a structured format
    const parsedAnalysis = parseAnalysisResponse(data.analysis);
    
    return parsedAnalysis;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

/**
 * Parses the analysis response into a structured format
 */
function parseAnalysisResponse(analysisText: string): { analysis: string } {
  // Return the raw analysis for now
  // In the future, we could parse this into a more structured format
  return { analysis: analysisText };
} 