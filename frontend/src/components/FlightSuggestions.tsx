import React, { useState, useEffect } from 'react';
import { FlightOption } from '../types';
import FlightTable from './FlightTable';
import { searchFlights } from '../services/flightService';
import { Plane } from 'lucide-react';

interface FlightSuggestionsProps {
  source: string;
  destination: string;
  date: Date;
}

const FlightSuggestions: React.FC<FlightSuggestionsProps> = ({ source, destination, date }) => {
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlights = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await searchFlights(source, destination, date);
        setFlights(response.best_flights);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch flights');
      } finally {
        setIsLoading(false);
      }
    };

    if (source && destination && date) {
      fetchFlights();
    }
  }, [source, destination, date]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Plane className="h-6 w-6 text-primary-600 animate-bounce" />
          <span className="text-gray-600">Searching for flights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-4 my-4">
        <p className="text-error-700">{error}</p>
      </div>
    );
  }

  if (!flights.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
        <p className="text-gray-600">No flights found for this route.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FlightTable flights={flights} />
    </div>
  );
};

export default FlightSuggestions;