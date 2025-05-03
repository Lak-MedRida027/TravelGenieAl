export interface TravelFormData {
  source: string;
  destination: string;
  startDate?: Date;
  endDate?: Date;
  budget: string;
  travelers: number;
  interests: string[];
  includeFlights: boolean;
  includeTransportation: boolean;
}

export interface ItineraryDay {
  day: number;
  activities: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  accommodation: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  estimatedCosts: {
    activities: number;
    accommodation: number;
    meals: number;
    transportation: number;
  };
}

export interface Airport {
  name: string;
  id: string;
  time: string;
}

export interface Flight {
  airline: string;
  departure: string;
  arrival: string;
  price: string;
}

export interface Layover {
  duration: number;
  name: string;
  id: string;
}

export interface CarbonEmissions {
  this_flight: number;
  typical_for_this_route: number;
  difference_percent: number;
}

export interface FlightOption {
  flights: Flight[];
  layovers: Layover[];
  total_duration: number;
  carbon_emissions: CarbonEmissions;
  price: number;
  type: string;
  airline_logo: string;
  booking_token: string;
}

export interface FlightResponse {
  best_flights: FlightOption[];
}

export interface Activity {
  time: string;
  description: string;
  cost: string;
  notes: string;
}

export interface Day {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

export interface Transportation {
  type: string;
  details: string;
  cost: string;
}

export interface TravelPlan {
  destination: string;
  summary: {
    title: string;
    dates: string;
    travelers: string;
    totalBudget: string;
    interests: string[];
  };
  preparation: {
    packingList: string[];
    culturalTips: Record<string, any>;
  };
  days: Day[];
  transportation: {
    betweenCities: Transportation[];
    localTransport: Transportation[];
  };
  budget: {
    totalEstimatedCost: string;
    note: string;
  };
  recommendations: {
    restaurants: string[];
    bookingAdvice: string[];
  };
  flights: Flight[];
  source: string;
  startDate?: Date;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';