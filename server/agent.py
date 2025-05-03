from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field, field_validator, ValidationInfo
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import requests
import asyncio
import os
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
import logging
import json
import re
# Add these imports at the top
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configuration
class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
    FLIGHT_API_URL = "https://serpapi.com/search.json"
    HOTEL_API_URL = "https://serpapi.com/search.json"
    REQUEST_TIMEOUT = 10  # seconds
    MAX_TRAVEL_DURATION = 365  # days
    EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", 465))
    EMAIL_USER = os.getenv("EMAIL_USER", "engcode213@gmail.com")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "iagy cykr kuco hkdo")

# Initialize FastAPI
app = FastAPI(title="AI Travel Agent API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini AI
if Config.GEMINI_API_KEY:
    genai.configure(api_key=Config.GEMINI_API_KEY)
    os.environ["GOOGLE_API_KEY"] = Config.GEMINI_API_KEY

# --------------------------
# Data Models
# --------------------------

class TravelRequest(BaseModel):
    source: str = Field(..., min_length=3, max_length=3, description="IATA airport code")
    destination: str = Field(..., min_length=3, max_length=3, description="IATA airport code")
    departure_date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    return_date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    budget: float = Field(..., gt=0)
    travelers: int = Field(..., gt=0)
    interests: List[str] = Field(default_factory=list)
    hotel_preferences: Dict[str, Any] = Field(default_factory=dict)

    @field_validator('return_date')
    @classmethod
    def validate_dates(cls, v: str, info: ValidationInfo) -> str:
        if 'departure_date' in info.data:
            dep_date = datetime.strptime(info.data['departure_date'], "%Y-%m-%d")
            ret_date = datetime.strptime(v, "%Y-%m-%d")
            if ret_date <= dep_date:
                raise ValueError("Return date must be after departure date")
            if (ret_date - dep_date).days > Config.MAX_TRAVEL_DURATION:
                raise ValueError(f"Trip duration cannot exceed {Config.MAX_TRAVEL_DURATION} days")
        return v

# --------------------------
# Response Models
# --------------------------

class Activity(BaseModel):
    time: str
    description: str
    cost: Optional[str] = None
    notes: Optional[str] = None

class DayItinerary(BaseModel):
    day: int
    date: str
    title: str
    activities: List[Activity]

class TransportationOption(BaseModel):
    airline: Optional[str] = None
    departure: str
    arrival: str
    price: str

class TransportationSummary(BaseModel):
    type: str
    route: Optional[str] = None
    options: List[TransportationOption]
    details: Optional[str] = None
    cost: Optional[str] = None

class BudgetBreakdown(BaseModel):
    total_estimated_cost: str
    note: str

class Recommendation(BaseModel):
    restaurants: List[str]
    booking_advice: List[str]

class TravelPlanResponse(BaseModel):
    travel_plan: Dict[str, Any]
    flight_options: Dict[str, Any]
    hotel_options: Dict[str, Any]
    status: str

# --------------------------
# Services
# --------------------------
class EmailService:
    @staticmethod
    def send_travel_email(to_email: str, subject: str, content: str) -> bool:
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = Config.EMAIL_USER
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Create both plain text and HTML versions
            msg.attach(MIMEText(content, 'plain'))
            msg.attach(MIMEText(f"<html><body><pre>{content}</pre></body></html>", 'html'))
            
            with smtplib.SMTP_SSL(Config.EMAIL_HOST, Config.EMAIL_PORT) as server:
                server.login(Config.EMAIL_USER, Config.EMAIL_PASSWORD)
                server.send_message(msg)
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False


class FlightService:
    @staticmethod
    async def search_flights(params: Dict) -> List[Dict]:
        try:
            flight_params = {
                "engine": "google_flights",
                "departure_id": params["source"],
                "arrival_id": params["destination"],
                "outbound_date": params["departure_date"],
                "return_date": params["return_date"],
                "currency": "USD",
                "hl": "en",
                "api_key": Config.SERPAPI_API_KEY
            }

            response = requests.get(
                Config.FLIGHT_API_URL,
                params=flight_params,
                timeout=Config.REQUEST_TIMEOUT
            )
            response.raise_for_status()
            
            data = response.json()
            return FlightService._parse_flight_data(data)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Flight API request failed: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Flight search failed: {str(e)}")
            return []

    @staticmethod
    def _parse_flight_data(data: Dict) -> List[Dict]:
        flights = []
        for flight in data.get("best_flights", [])[:3]:  # Limit to 3 options
            try:
                price_str = str(flight.get("price", "0"))
                price = float(price_str.replace("$", "").replace(",", ""))
                
                departure_time = flight["flights"][0]["departure_airport"].get("time", "")
                arrival_time = flight["flights"][-1]["arrival_airport"].get("time", "")
                
                flights.append({
                    "airline": flight["flights"][0].get("airline", "Unknown"),
                    "departure": departure_time.split()[0] if departure_time else "",
                    "arrival": arrival_time.split()[0] if arrival_time else "",
                    "price": f"{price:.2f}"
                })
            except Exception as e:
                logger.warning(f"Skipping flight due to parsing error: {str(e)}")
        return flights

class HotelService:
    @staticmethod
    async def search_hotels(params: Dict) -> List[Dict]:
        try:
            hotel_params = {
                "engine": "google_hotels",
                "q": f"Hotels in {params['destination']}",
                "check_in_date": params["departure_date"],
                "check_out_date": params["return_date"],
                "adults": params["travelers"],
                "currency": "USD",
                "hl": "en",
                "gl": "us",
                "api_key": Config.SERPAPI_API_KEY
            }

            response = requests.get(
                Config.HOTEL_API_URL,
                params=hotel_params,
                timeout=Config.REQUEST_TIMEOUT
            )
            response.raise_for_status()
            
            data = response.json()
            return HotelService._parse_hotel_data(data)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Hotel API request failed: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Hotel search failed: {str(e)}")
            return []

    @staticmethod
    def _parse_hotel_data(data: Dict) -> List[Dict]:
        hotels = []
        for hotel in data.get("properties", [])[:5]:  # Limit to 5 options
            try:
                price_str = str(hotel.get("price", "0"))
                if "$" in price_str:
                    price = float(price_str.replace("$", "").replace(",", "").split()[0])
                elif isinstance(hotel.get("price"), (int, float)):
                    price = float(hotel.get("price"))
                else:
                    price = 0.0
                
                hotels.append({
                    "name": hotel.get("name", "Unknown Hotel"),
                    "price": f"{price:.2f}",
                    "rating": float(hotel.get("rating", 0)),
                    "review_count": int(hotel.get("review_count", 0)),
                    "address": hotel.get("address", ""),
                    "amenities": hotel.get("amenities", [])
                })
            except Exception as e:
                logger.warning(f"Skipping hotel due to parsing error: {str(e)}")
        return hotels

class ItineraryService:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    async def generate_full_plan(self, flights: List, hotels: List, request: TravelRequest) -> Dict:
        prompt = self._build_prompt(flights, hotels, request)
        
        try:
            response = self.model.generate_content(prompt)
            return self._parse_response(response.text, flights, hotels, request)
        except Exception as e:
            logger.error(f"Itinerary generation failed: {str(e)}")
            return self._default_response(flights, hotels, request)

    def _format_flights(self, flights: List) -> str:
        """Format flight information for the prompt"""
        if not flights:
            return "No flight options available"
        
        formatted = []
        for i, flight in enumerate(flights[:3]):  # Show top 3 options
            airline = flight.get('airline', 'Unknown airline')
            departure = flight.get('departure', 'Unknown time')
            arrival = flight.get('arrival', 'Unknown time')
            price = flight.get('price', 'Unknown price')
            formatted.append(f"{i+1}. {airline}: {departure} → {arrival} (Price: {price})")
        
        return "\n".join(formatted)

    def _format_hotels(self, hotels: List) -> str:
        """Format hotel information for the prompt"""
        if not hotels:
            return "No hotel options available"
        
        formatted = []
        for i, hotel in enumerate(hotels[:3]):  # Show top 3 options
            name = hotel.get('name', 'Unknown hotel')
            price = hotel.get('price', 'Unknown price')
            rating = hotel.get('rating', 0)
            address = hotel.get('address', 'No address')
            formatted.append(f"{i+1}. {name} ({rating}★): {price}/night | {address}")
        
        return "\n".join(formatted)

    def _build_prompt(self, flights: List, hotels: List, request: TravelRequest) -> str:
        # Calculate trip duration
        dep_date = datetime.strptime(request.departure_date, "%Y-%m-%d")
        ret_date = datetime.strptime(request.return_date, "%Y-%m-%d")
        trip_duration = (ret_date - dep_date).days
        
        return f"""
        Create a detailed {trip_duration}-day travel itinerary from {request.source} to {request.destination} 
        for {request.travelers} travelers from {request.departure_date} to {request.return_date} 
        with a budget of ${request.budget}.

        Traveler Interests: {", ".join(request.interests) if request.interests else "General sightseeing"}

        Available Flight Options:
        {self._format_flights(flights)}

        Available Hotel Options:
        {self._format_hotels(hotels)}

        Requirements:
        1. Create a complete daily itinerary for all {trip_duration} days
        2. Include 3-5 activities per day (morning, afternoon, evening)
        3. Include estimated costs for major activities
        4. Include transportation details between locations
        5. Include meal recommendations based on interests
        6. Include free time for exploration

        Please create a comprehensive travel plan in EXACTLY this JSON format:
        {{
            "travel_plan": {{
                "trip_overview": {{
                    "title": "X-Day [interests] Journey",
                    "dates": "YYYY-MM-DD to YYYY-MM-DD",
                    "travelers": "X",
                    "total_budget": "XXXX",
                    "interests": ["interest1", "interest2"]
                }},
                "preparation": {{
                    "packing_list": ["item1", "item2"],
                    "cultural_tips": {{}}
                }},
                "daily_itinerary": [
                    {{
                        "day": 1,
                        "date": "YYYY-MM-DD",
                        "title": "Day 1 - Arrival",
                        "activities": [
                            {{
                                "time": "Morning",
                                "description": "Activity description",
                                "cost": "XX",
                                "notes": "Additional notes"
                            }}
                        ]
                    }}
                ],
                "transportation_summary": {{
                    "between_cities": [
                        {{
                            "type": "Flight",
                            "route": "{request.source}-{request.destination}",
                            "options": {json.dumps(flights[:3])}
                        }}
                    ],
                    "local_transport": [
                        {{
                            "type": "Public Transport",
                            "details": "Details",
                            "cost": "XX"
                        }}
                    ]
                }},
                "budget_breakdown": {{
                    "total_estimated_cost": "XXXX",
                    "note": "Budget notes"
                }},
                "recommendations": {{
                    "restaurants": ["Restaurant1", "Restaurant2"],
                    "booking_advice": ["Advice1", "Advice2"]
                }}
            }},
            "flight_options": {{
                "note": "Flight options for {request.travelers} travelers",
                "options": {json.dumps(flights[:3])}
            }},
            "hotel_options": {{
                "note": "Hotel options",
                "options": {json.dumps(hotels[:3])}
            }},
            "status": "success"
        }}
        """

    def _parse_response(self, response_text: str, flights: List, hotels: List, request: TravelRequest) -> Dict:
        try:
            # Clean the response text
            cleaned_text = response_text.strip()
            cleaned_text = re.sub(r'^```json\s*|\s*```$', '', cleaned_text, flags=re.MULTILINE)
            
            # Parse the JSON
            plan = json.loads(cleaned_text)
            
            # Ensure all required fields are present
            if "travel_plan" not in plan:
                plan["travel_plan"] = self._default_travel_plan(request)
            if "flight_options" not in plan:
                plan["flight_options"] = {
                    "note": f"Flight options for {request.travelers} travelers",
                    "options": flights[:3]
                }
            if "hotel_options" not in plan:
                plan["hotel_options"] = {
                    "note": "Hotel options",
                    "options": hotels[:3]
                }
            
            plan["status"] = "success"
            return plan
            
        except Exception as e:
            logger.error(f"Failed to parse Gemini response: {str(e)}")
            return self._default_response(flights, hotels, request)

    def _default_response(self, flights: List, hotels: List, request: TravelRequest) -> Dict:
        return {
            "travel_plan": self._default_travel_plan(request),
            "flight_options": {
                "note": f"Flight options for {request.travelers} travelers",
                "options": flights[:3]
            },
            "hotel_options": {
                "note": "Hotel options",
                "options": hotels[:3]
            },
            "status": "success"
        }

    def _default_travel_plan(self, request: TravelRequest) -> Dict:
        # Calculate trip duration
        dep_date = datetime.strptime(request.departure_date, "%Y-%m-%d")
        ret_date = datetime.strptime(request.return_date, "%Y-%m-%d")
        trip_duration = (ret_date - dep_date).days
        
        # Generate daily itinerary for all days
        daily_itinerary = []
        current_date = dep_date
        
        for day in range(1, trip_duration + 1):
            date_str = current_date.strftime("%Y-%m-%d")
            
            if day == 1:
                # Arrival day
                activities = [
                    {
                        "time": "Afternoon",
                        "description": "Arrive and check into hotel",
                        "cost": "",
                        "notes": "Get settled and explore the local area"
                    },
                    {
                        "time": "Evening",
                        "description": "Welcome dinner",
                        "cost": "$30-50 per person",
                        "notes": "Try local specialties"
                    }
                ]
                title = f"Day {day} - Arrival"
            elif day == trip_duration:
                # Departure day
                activities = [
                    {
                        "time": "Morning",
                        "description": "Final sightseeing or shopping",
                        "cost": "",
                        "notes": "Pick up last-minute souvenirs"
                    },
                    {
                        "time": "Afternoon",
                        "description": "Hotel check-out and airport transfer",
                        "cost": "",
                        "notes": "Allow extra time for traffic"
                    }
                ]
                title = f"Day {day} - Departure"
            else:
                # Regular days
                activities = [
                    {
                        "time": "Morning",
                        "description": f"{request.interests[0] if request.interests else 'Sightseeing'} activity",
                        "cost": "$20-40",
                        "notes": "Check opening hours"
                    },
                    {
                        "time": "Afternoon",
                        "description": "Lunch and free time",
                        "cost": "$15-30",
                        "notes": "Local cafe recommended"
                    },
                    {
                        "time": "Evening",
                        "description": "Cultural activity or dinner",
                        "cost": "$25-60",
                        "notes": "Reservations suggested"
                    }
                ]
                title = f"Day {day}"
            
            daily_itinerary.append({
                "day": day,
                "date": date_str,
                "title": title,
                "activities": activities
            })
            current_date += timedelta(days=1)
        
        return {
            "trip_overview": {
                "title": f"{trip_duration}-Day {', '.join(request.interests) if request.interests else 'General'} Journey",
                "dates": f"{request.departure_date} to {request.return_date}",
                "travelers": str(request.travelers),
                "total_budget": str(request.budget),
                "interests": request.interests if request.interests else ["General sightseeing"]
            },
            "preparation": {
                "packing_list": [
                    "Comfortable walking shoes",
                    "Weather-appropriate clothing",
                    "Travel adapters",
                    "Essential toiletries",
                    "First-aid kit"
                ],
                "cultural_tips": {}
            },
            "daily_itinerary": daily_itinerary,
            "transportation_summary": {
                "between_cities": [],
                "local_transport": [{
                    "type": "Public Transport",
                    "details": "Local transit options",
                    "cost": "Varies"
                }]
            },
            "budget_breakdown": {
                "total_estimated_cost": f"${request.budget}",
                "note": "This is a default itinerary. Actual costs may vary."
            },
            "recommendations": {
                "restaurants": ["Local cuisine"],
                "booking_advice": [
                    "Book popular attractions in advance",
                    "Check visa requirements if international"
                ]
            }
        }
# --------------------------
# API Endpoints
# --------------------------

@app.post("/generate-travel-plan", response_model=TravelPlanResponse)
async def generate_travel_plan(request: TravelRequest):
    """
    Generate a complete travel plan with:
    - Flight options
    - Hotel options
    - Detailed itinerary
    - Budget breakdown
    """
    try:
        # Get flights and hotels concurrently
        flights_task = asyncio.create_task(FlightService.search_flights(request.model_dump()))
        hotels_task = asyncio.create_task(HotelService.search_hotels(request.model_dump()))
        
        flights, hotels = await asyncio.gather(flights_task, hotels_task)

        # Generate full travel plan
        itinerary_service = ItineraryService()
        plan = await itinerary_service.generate_full_plan(flights, hotels, request)
        
        return plan

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/send-travel-plan")
async def send_travel_plan(
    plan_response: TravelPlanResponse,
    recipient_email: str
):
    """
    Format the travel plan into human-readable text and send via email.
    
    Parameters:
    - plan_response: The response from /generate-travel-plan
    - recipient_email: Email address to send the plan to
    
    Returns:
    - {"status": "success" or "error", "message": "Details"}
    """
    try:
        # Format the travel plan into human-readable text
        formatted_text = format_travel_plan(plan_response)
        
        # Send email
        email_sent = EmailService.send_travel_email(
            to_email=recipient_email,
            subject=f"Your Travel Plan: {plan_response.travel_plan['trip_overview']['title']}",
            content=formatted_text
        )
        
        if email_sent:
            return {"status": "success", "message": "Email sent successfully"}
        else:
            return {"status": "error", "message": "Failed to send email"}
            
    except Exception as e:
        logger.error(f"Error sending travel plan email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

def format_travel_plan(plan: TravelPlanResponse) -> str:
    """Convert the travel plan response to human-readable text"""
    trip = plan.travel_plan
    flights = plan.flight_options['options']
    hotels = plan.hotel_options.get('options', [])
    
    # Format trip overview
    text = f"✈️ {trip['trip_overview']['title']}\n"
    text += f"📅 Dates: {trip['trip_overview']['dates']}\n"
    text += f"👥 Travelers: {trip['trip_overview']['travelers']}\n"
    text += f"💰 Budget: {trip['trip_overview']['total_budget']}\n"
    text += f"🎯 Interests: {', '.join(trip['trip_overview']['interests'])}\n\n"
    
    # Format flights
    text += "🛫 FLIGHT OPTIONS:\n"
    for i, flight in enumerate(flights[:3], 1):
        text += (f"{i}. {flight['airline']}: {flight['departure']} → {flight['arrival']} "
                f"(Price: {flight['price']})\n")
    text += "\n"
    
    # Format hotels
    text += "🏨 HOTEL OPTIONS:\n"
    for i, hotel in enumerate(hotels[:3], 1):
        text += (f"{i}. {hotel['name']} ({hotel['rating']}★): {hotel['price']}/night\n"
                f"   📍 {hotel['address']}\n")
    text += "\n"
    
    # Format itinerary
    text += "📝 DAILY ITINERARY:\n"
    for day in trip['daily_itinerary']:
        text += f"\nDay {day['day']}: {day['title']} ({day['date']})\n"
        for activity in day['activities']:
            text += f"  ⏰ {activity['time']}: {activity['description']}"
            if activity['cost']:
                text += f" ({activity['cost']})"
            if activity['notes']:
                text += f" - Note: {activity['notes']}"
            text += "\n"
    
    # Format budget
    text += "\n💰 BUDGET BREAKDOWN:\n"
    if isinstance(trip['budget_breakdown'], dict):
        for category, amount in trip['budget_breakdown'].items():
            if category != "note":
                text += f"  • {category.title()}: {amount}\n"
        if 'note' in trip['budget_breakdown']:
            text += f"  📌 {trip['budget_breakdown']['note']}\n"
    
    # Format recommendations
    text += "\n🌟 RECOMMENDATIONS:\n"
    if 'restaurants' in trip['recommendations']:
        text += "  🍽️ Restaurants:\n"
        for restaurant in trip['recommendations']['restaurants']:
            text += f"    • {restaurant}\n"
    
    if 'booking_advice' in trip['recommendations']:
        text += "  💡 Booking Advice:\n"
        for advice in trip['recommendations']['booking_advice']:
            text += f"    • {advice}\n"
    
    return text

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# --------------------------
# Main Application
# --------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)