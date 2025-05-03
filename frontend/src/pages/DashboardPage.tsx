import { useState } from 'react';
import Header from '../components/Header';
import TravelForm from '../components/TravelForm';
import TravelPlan from '../components/TravelPlan';
import Footer from '../components/Footer';
import { LoadingState, TravelPlan as TravelPlanType } from '../types';

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

const DashboardPage = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [travelPlan, setTravelPlan] = useState<TravelPlanType | null>(null);
  const [flightOptions, setFlightOptions] = useState<FlightOptions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (plan: TravelPlanType, options: FlightOptions) => {
    setTravelPlan(plan);
    setFlightOptions(options);
    setLoadingState('success');
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setLoadingState('error');
  };

  const resetForm = () => {
    setTravelPlan(null);
    setFlightOptions(null);
    setLoadingState('idle');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {loadingState === 'idle' || loadingState === 'loading' || loadingState === 'error' ? (
          <TravelForm 
            onPlanGenerated={handleFormSubmit} 
            onError={handleError}
            loadingState={loadingState}
            setLoadingState={setLoadingState}
          />
        ) : (
          <div className="animate-fade-in">
            {travelPlan && (
              <TravelPlan 
                plan={travelPlan}
                flightOptions={flightOptions || undefined}
                onReset={resetForm} 
              />
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;