import React, { useState } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { TravelFormData, LoadingState, TravelPlan } from '../types';
import { generateTravelPlan } from '../services/travelService';
import { CalendarDays, MapPin, DollarSign, Users, Sparkles, Plane, Bus } from 'lucide-react';
import LoadingIndicator from './LoadingIndicator';

const interests = [
  'Adventure', 'Art & Culture', 'Beach', 'Food & Dining', 
  'History', 'Luxury', 'Nature', 'Nightlife', 'Shopping', 
  'Sports', 'Wildlife', 'Wellness & Spa'
];

interface TravelFormProps {
  onPlanGenerated: (plan: TravelPlan, flightOptions: FlightOptions) => void;
  onError: (error: string) => void;
  loadingState: LoadingState;
  setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>;
}

interface FlightOptions {
  options: Array<{
    flights: {
      airline: string;
      departure: string;
      arrival: string;
      price: string;
    }[];
    layovers: {
      duration: number;
      name: string;
      id: string;
    }[];
    total_duration: number;
    carbon_emissions: {
      this_flight: number;
      typical_for_this_route: number;
      difference_percent: number;
    };
    price: number;
    type: string;
    airline_logo: string;
    booking_token: string;
  }>;
}

const TravelForm: React.FC<TravelFormProps> = ({ 
  onPlanGenerated, 
  onError,
  loadingState,
  setLoadingState
}) => {
  const [formData, setFormData] = useState<TravelFormData>({
    source: '',
    destination: '',
    startDate: undefined,
    endDate: undefined,
    budget: '',
    travelers: 1,
    interests: [],
    includeFlights: false,
    includeTransportation: false
  });

  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'travelers') {
      const numValue = parseInt(value);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) || numValue < 1 ? 1 : numValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      if (prev.interests.includes(interest)) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    setFormData(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: date
    }));
    setShowDatePicker(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.source || !formData.destination) {
      onError('Please enter both source and destination.');
      return;
    }

    if (formData.interests.length === 0) {
      onError('Please select at least one interest.');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      onError('Please select both departure and return dates.');
      return;
    }

    if (!formData.budget) {
      onError('Please enter your budget.');
      return;
    }

    try {
      setLoadingState('loading');
      const response = await generateTravelPlan(formData);
      onPlanGenerated(response.plan, response.flightOptions);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred while generating your travel plan.');
    }
  };

  const formatDateDisplay = (date: Date | undefined) => {
    return date ? format(date, 'MMM dd, yyyy') : 'Select date';
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden transition-all">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
        <h2 className="text-2xl font-bold">Your Dream Trip Awaits</h2>
        <p className="mt-2 opacity-90">Tell us about your perfect getaway, and let AI create your personalized travel plan.</p>
      </div>

      {loadingState === 'error' && (
        <div className="p-4 bg-error-50 border-l-4 border-error-500 text-error-700">
          <p>There was an error generating your travel plan. Please try again.</p>
        </div>
      )}

      {loadingState === 'loading' ? (
        <div className="p-10">
          <LoadingIndicator />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-primary-500" />
                Traveling From
              </label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                placeholder="City or Country"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-secondary-500" />
                Destination
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="Where to?"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative">
            <div>
              <label className="block mb-2 font-medium text-gray-700 flex items-center">
                <CalendarDays className="h-4 w-4 mr-1 text-primary-500" />
                When are you going?
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(prev => prev === 'start' ? null : 'start')}
                  className="flex-1 p-3 border border-gray-300 rounded-md text-left focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-all"
                >
                  {formatDateDisplay(formData.startDate)}
                </button>
                <span className="self-center">to</span>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(prev => prev === 'end' ? null : 'end')}
                  className="flex-1 p-3 border border-gray-300 rounded-md text-left focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-all"
                >
                  {formatDateDisplay(formData.endDate)}
                </button>
              </div>
              
              {showDatePicker && (
                <div className="absolute z-10 mt-1 bg-white shadow-lg rounded-lg p-4 border border-gray-200">
                  <DayPicker
                    mode="single"
                    selected={showDatePicker === 'start' ? formData.startDate : formData.endDate}
                    onSelect={(date) => handleDateSelect(date, showDatePicker)}
                    fromDate={showDatePicker === 'end' && formData.startDate ? formData.startDate : new Date()}
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700 flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-success-500" />
                Budget
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="Enter your budget in USD"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-all"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 flex items-center">
              <Users className="h-4 w-4 mr-1 text-accent-500" />
              Number of Travelers
            </label>
            <input
              type="number"
              name="travelers"
              value={formData.travelers}
              onChange={handleInputChange}
              min="1"
              max="20"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="block mb-3 font-medium text-gray-700 flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-secondary-500" />
              Interests (select at least one)
            </label>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-2 rounded-full text-sm transition-all ${
                    formData.interests.includes(interest)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-md text-white font-medium bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition-all"
            >
              Plan My Trip
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TravelForm;