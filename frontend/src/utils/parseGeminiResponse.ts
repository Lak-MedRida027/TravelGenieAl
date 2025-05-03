import type { TravelPlan } from "../types";

export const parseGeminiResponse = (responseText: string): TravelPlan => {
  try {
    // Extract JSON from the response text
    let jsonStr = responseText.trim();
    
    // Look for JSON content with improved regex pattern
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("No valid JSON object found in response");
    }

    jsonStr = jsonMatch[0];

    // Clean up any potential formatting issues
    jsonStr = jsonStr
      .replace(/[\u201C\u201D]/g, '"') // Replace curly quotes with straight quotes
      .replace(/\\n/g, ' ') // Replace newlines with spaces
      .replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas

    // Parse the JSON
    const parsedData = JSON.parse(jsonStr) as TravelPlan;
    
    // Validate required fields and data structure
    if (!parsedData.destination || typeof parsedData.destination !== 'string') {
      throw new Error("Invalid or missing destination");
    }
    
    if (!parsedData.summary || typeof parsedData.summary !== 'string') {
      throw new Error("Invalid or missing summary");
    }
    
    if (!Array.isArray(parsedData.days) || parsedData.days.length === 0) {
      throw new Error("Invalid or empty days array");
    }

    // Validate each day's structure
    parsedData.days.forEach((day, index) => {
      if (!day.day || !day.activities || !day.meals || !day.estimatedCosts) {
        throw new Error(`Invalid data structure in day ${index + 1}`);
      }
    });
    
    return parsedData;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    
    // Return a more informative fallback plan
    return {
      destination: "Error",
      summary: `There was an error processing your travel plan: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
      tips: ["Please check your input and try again."],
      days: [{
        day: 1,
        activities: {
          morning: "Error loading activities",
          afternoon: "Error loading activities",
          evening: "Error loading activities"
        },
        meals: {
          breakfast: "Error loading meals",
          lunch: "Error loading meals",
          dinner: "Error loading meals"
        },
        accommodation: "Error loading accommodation",
        estimatedCosts: {
          activities: 0,
          accommodation: 0,
          meals: 0,
          transportation: 0
        }
      }],
      totalCost: 0
    };
  }
};