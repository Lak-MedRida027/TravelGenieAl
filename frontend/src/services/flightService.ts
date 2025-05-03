import { FlightResponse } from '../types';

const mockFlightData: FlightResponse = {
  "best_flights": [
    {
      "flights": [
        {
          "departure_airport": {
            "name": "Indira Gandhi International Airport",
            "id": "DEL",
            "time": "2025-05-03 18:00"
          },
          "arrival_airport": {
            "name": "Netaji Subhash Chandra Bose International Airport",
            "id": "CCU",
            "time": "2025-05-03 20:15"
          },
          "duration": 135,
          "airplane": "Airbus A321neo",
          "airline": "IndiGo",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/6E.png",
          "travel_class": "Economy",
          "flight_number": "6E 2057",
          "legroom": "28 in",
          "extensions": [
            "Below average legroom (28 in)",
            "Carbon emissions estimate: 91 kg"
          ],
          "often_delayed_by_over_30_min": true
        }
      ],
      "layovers": [],
      "total_duration": 135,
      "carbon_emissions": {
        "this_flight": 214000,
        "typical_for_this_route": 225000,
        "difference_percent": -5
      },
      "price": 332,
      "type": "One way",
      "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/6E.png",
      "booking_token": "WyJDalJJUjBSUlkzTlJaM05vYVVWQlFUQkpZWGRDUnkwdExTMHRMUzB0TFMxMmQyeHFNMEZCUVVGQlIyZFZWV1JqVGxKbFZsVkJFZzAyUlRJd05UZDhOa1V4TmpNeEdnc0kwNElDRUFJYUExVlRSRGdjY05PQ0FnPT0iLFtbIkRFTCIsIjIwMjUtMDUtMDMiLCJDQ1UiLG51bGwsIjZFIiwiMjA1NyJdLFsiQ0NVIiwiMjAyNS0wNS0wMyIsIkhBTiIsbnVsbCwiNkUiLCIxNjMxIl1dXQ=="
    }
  ]
};

export const searchFlights = async (
  source: string,
  destination: string,
  date: Date
): Promise<FlightResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockFlightData;
};