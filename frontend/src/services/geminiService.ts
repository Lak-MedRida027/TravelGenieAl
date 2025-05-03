import { GoogleGenerativeAI } from "@google/generative-ai";
import type { TravelFormData, TravelPlan } from "../types";
import { searchFlights } from "./flightService";

let genAI: GoogleGenerativeAI;
let model: any;

export const initGeminiAPI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};

const getAirportCode = (city: string): string => {
  const normalizedCity = city.toLowerCase().trim();
  return normalizedCity.replace(/[^a-z]/g, '').slice(0, 3).toUpperCase();
};

export const generateTravelPlan = async (formData: TravelFormData): Promise<TravelPlan> => {
  if (!model) {
    initGeminiAPI();
  }

  const { source, destination, startDate, endDate, budget, travelers, interests, includeFlights, includeTransportation } = formData;

  const sourceCode = getAirportCode(source);
  const destinationCode = getAirportCode(destination);
  const startDateStr = startDate ? startDate.toISOString().split('T')[0] : 'Not specified';
  const endDateStr = endDate ? endDate.toISOString().split('T')[0] : 'Not specified';
  
  let daysCount = 0;
  if (startDate && endDate) {
    daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  const prompt = `
    Create a detailed travel itinerary with the following information:
    
    - Traveling from: ${source} (${sourceCode})
    - Destination: ${destination} (${destinationCode})
    - Start date: ${startDateStr}
    - End date: ${endDateStr}
    - Number of days: ${daysCount > 0 ? daysCount : 'Not specified'}
    - Budget: ${budget}
    - Number of travelers: ${travelers}
    - Interests: ${interests.join(', ')}
    ${includeTransportation ? '- Include local transportation options and costs' : ''}

    Please generate a comprehensive travel plan with the following:
    1. A brief summary of the destination
    2. Detailed day-by-day itinerary including:
       - Morning, afternoon and evening activities
       - Recommended accommodations
       - Meal suggestions (breakfast, lunch, dinner)
       - Estimated costs for activities, accommodations, meals, and transportation
    3. Local tips and cultural insights
    4. Total estimated cost for the entire trip
    ${includeTransportation ? '5. Local transportation details including public transport, ridesharing, and walking options' : ''}
    
    Format your response consistently as JSON that can be parsed. Use this exact format:
    
    {
      "destination": "Destination Name",
      "summary": "Brief summary of the destination",
      "tips": ["Tip 1", "Tip 2", "Tip 3"],
      "days": [
        {
          "day": 1,
          "activities": {
            "morning": "Morning activity description",
            "afternoon": "Afternoon activity description",
            "evening": "Evening activity description"
          },
          "accommodation": "Accommodation details",
          "meals": {
            "breakfast": "Breakfast suggestion",
            "lunch": "Lunch suggestion",
            "dinner": "Dinner suggestion"
          },
          "estimatedCosts": {
            "activities": 100,
            "accommodation": 150,
            "meals": 80,
            "transportation": 30
          }
        }
      ],
      "totalCost": 2500${includeTransportation ? ',\n      "transportationDetails": {\n        "publicTransport": ["Option 1", "Option 2"],\n        "ridesharing": ["Option 1", "Option 2"],\n        "walking": ["Option 1", "Option 2"],\n        "costs": {\n          "daily": 20,\n          "total": 100\n        }\n      }' : ''}
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const plan = JSON.parse(jsonMatch[0]) as TravelPlan;

    // Add source and start date for flight search
    plan.source = source;
    plan.startDate = startDate;

    // Add flight information if requested
    if (includeFlights && startDate) {
      try {
        const flightResponse = await searchFlights(source, destination, startDate);
        plan.flights = flightResponse.best_flights.map((option: any) => option.flights[0]);
      } catch (error) {
        console.error("Error fetching flights:", error);
        // Continue without flight data
      }
    }

    return plan;
  } catch (error) {
    console.error("Error generating travel plan:", error);
    throw error;
  }
};

export const generateTravelAdvice = async (question: string): Promise<string> => {
  if (!model) {
    initGeminiAPI();
  }

  try {
    const result = await model.generateContent(`
      As a travel expert, please provide helpful advice for the following question:
      ${question}
      
      Keep the response concise, informative, and focused on practical travel advice.
    `);
    
    return result.response.text();
  } catch (error) {
    console.error("Error generating travel advice:", error);
    throw error;
  }
};