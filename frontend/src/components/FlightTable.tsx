import React from 'react';
import { FlightOption } from '../types';
import { Clock, Plane, Leaf } from 'lucide-react';

interface FlightTableProps {
  flights: FlightOption[];
}

const FlightTable: React.FC<FlightTableProps> = ({ flights }) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getBookingUrl = (token: string) => {
    return `https://google.com/travel/flights/booking?token=${token}`;
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
      <h3 className="text-xl font-semibold p-6 bg-primary-50 border-b border-primary-100">
        Available Flights
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Airline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flights.map((option, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <Plane className="h-5 w-5 text-primary-500" />
                    <span>{option.flights[0].airline}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    {option.flights.map((flight, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="font-medium">{flight.departure_airport.id}</span>
                        <Plane className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{flight.arrival_airport.id}</span>
                        <span className="text-sm text-gray-500">
                          ({formatDateTime(flight.departure_airport.time)})
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{formatDuration(option.total_duration)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium">${option.price}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Leaf className="h-4 w-4 text-green-500" />
                      <span>
                        {option.carbon_emissions.difference_percent > 0 ? '+' : ''}
                        {option.carbon_emissions.difference_percent}% vs. typical
                      </span>
                    </div>
                    {option.layovers.map((layover, idx) => (
                      <div key={idx}>
                        Layover: {formatDuration(layover.duration)} in {layover.id}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a
                    href={getBookingUrl(option.booking_token)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Book Now
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightTable;