import React, { useState } from 'react';
import { TravelPlan as TravelPlanType } from '../types';
import { Calendar, MapPin, Users, DollarSign, Plane, Bus, Utensils, BookOpen, Luggage, Info, ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { Mail } from 'lucide-react';
import { sendTravelPlan } from '../services/travelService';

interface FlightOption {
  airline: string;
  departure: string;
  arrival: string;
  price: string;
}

interface TransportationOption {
  type: string;
  route: string;
  options: FlightOption[];
}

interface TravelPlanProps {
  plan: TravelPlanType;
  flightOptions?: FlightOptions;
  onReset: () => void;
}

const TravelPlan: React.FC<TravelPlanProps> = ({ plan, flightOptions, onReset }) => {
  const [activeDay, setActiveDay] = useState(1);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');

  // Add detailed console logging
  console.log('Full Plan:', plan);
  console.log('Travel Plan:', plan.travel_plan);
  console.log('Transportation Summary:', plan.travel_plan?.transportation_summary);
  console.log('Between Cities:', plan.travel_plan?.transportation_summary?.between_cities);
  console.log('First Between City:', plan.travel_plan?.transportation_summary?.between_cities?.[0]);
  console.log('Flight Options:', plan.travel_plan?.transportation_summary?.between_cities?.[0]?.options);

  // Add console logging
  console.log('Transportation Summary:', plan.transportation_summary);
  console.log('Between Cities:', plan.transportation_summary?.between_cities);
  console.log('First Between City:', plan.transportation_summary?.between_cities?.[0]);
  console.log('Flight Options:', plan.transportation_summary?.between_cities?.[0]?.options);

  // Add detailed console logging
  console.log('Full Plan:', plan);
  console.log('Flight Options:', plan.flight_options);
  console.log('Flight Options Array:', plan.flight_options?.options);

  const generatePDF = () => {
    const doc = new jsPDF();
    let yOffset = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - (2 * margin);

    // Add title
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    const titleLines = doc.splitTextToSize(plan.summary.title, maxWidth);
    doc.text(titleLines, margin, yOffset);
    yOffset += (titleLines.length * 10) + 10;

    // Add trip overview
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text('Trip Overview', margin, yOffset);
    yOffset += 10;

    // Add trip details
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    const details = [
      `Dates: ${plan.summary.dates}`,
      `Travelers: ${plan.summary.travelers}`,
      `Budget: ${plan.summary.totalBudget}`,
      `Interests: ${plan.summary.interests.join(', ')}`
    ];

    details.forEach(detail => {
      const lines = doc.splitTextToSize(detail, maxWidth - 10);
      doc.text(lines, margin + 5, yOffset);
      yOffset += (lines.length * 7);
    });
    yOffset += 10;

    // Add preparation
    if (yOffset > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yOffset = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text('Preparation', margin, yOffset);
    yOffset += 10;

    // Add packing list
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('Packing List:', margin + 5, yOffset);
    yOffset += 7;
    plan.preparation.packingList.forEach(item => {
      const lines = doc.splitTextToSize(`• ${item}`, maxWidth - 15);
      doc.text(lines, margin + 10, yOffset);
      yOffset += (lines.length * 7);
    });
    yOffset += 5;

    // Add cultural tips
    doc.text('Cultural Tips:', margin + 5, yOffset);
    yOffset += 7;
    Object.entries(plan.preparation.culturalTips).forEach(([key, value]) => {
      const tipText = `• ${key}: ${value}`;
      const lines = doc.splitTextToSize(tipText, maxWidth - 15);
      doc.text(lines, margin + 10, yOffset);
      yOffset += (lines.length * 7);
    });
    yOffset += 10;

    // Add daily itinerary
    plan.days.forEach(day => {
      // Check if we need a new page
      if (yOffset > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(52, 73, 94);
      const dayTitle = `Day ${day.day} - ${day.title}`;
      const titleLines = doc.splitTextToSize(dayTitle, maxWidth);
      doc.text(titleLines, margin, yOffset);
      yOffset += (titleLines.length * 10) + 5;

      day.activities.forEach(activity => {
        if (yOffset > doc.internal.pageSize.height - 40) {
          doc.addPage();
          yOffset = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80);
        const activityText = `${activity.time}: ${activity.description}`;
        const lines = doc.splitTextToSize(activityText, maxWidth - 10);
        doc.text(lines, margin + 5, yOffset);
        yOffset += (lines.length * 7);

        if (activity.cost) {
          const costText = `Cost: ${activity.cost}`;
          doc.text(costText, margin + 10, yOffset);
          yOffset += 7;
        }
        if (activity.notes) {
          const noteLines = doc.splitTextToSize(`Notes: ${activity.notes}`, maxWidth - 15);
          doc.text(noteLines, margin + 10, yOffset);
          yOffset += (noteLines.length * 7);
        }
        yOffset += 5;
      });
      yOffset += 10;
    });

    // Add transportation
    if (yOffset > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yOffset = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text('Transportation', margin, yOffset);
    yOffset += 10;

    plan.transportation.localTransport.forEach(transport => {
      if (yOffset > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80);
      const transportText = `${transport.type}: ${transport.details}`;
      const lines = doc.splitTextToSize(transportText, maxWidth - 10);
      doc.text(lines, margin + 5, yOffset);
      yOffset += (lines.length * 7);
      doc.text(`Cost: ${transport.cost}`, margin + 10, yOffset);
      yOffset += 10;
    });

    // Add recommendations
    if (yOffset > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yOffset = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text('Recommendations', margin, yOffset);
    yOffset += 10;

    // Add restaurants
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('Restaurants:', margin + 5, yOffset);
    yOffset += 7;
    plan.recommendations.restaurants.forEach(restaurant => {
      if (yOffset > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yOffset = 20;
      }
      const lines = doc.splitTextToSize(`• ${restaurant}`, maxWidth - 15);
      doc.text(lines, margin + 10, yOffset);
      yOffset += (lines.length * 7);
    });
    yOffset += 5;

    // Add booking advice
    doc.text('Booking Advice:', margin + 5, yOffset);
    yOffset += 7;
    plan.recommendations.bookingAdvice.forEach(advice => {
      if (yOffset > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yOffset = 20;
      }
      const lines = doc.splitTextToSize(`• ${advice}`, maxWidth - 15);
      doc.text(lines, margin + 10, yOffset);
      yOffset += (lines.length * 7);
    });

    return doc;
  };

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save(`${plan.destination.toLowerCase().replace(/\s+/g, '-')}-travel-plan.pdf`);
  };

  const handleSendEmail = async () => {
    if (!email) {
      setEmailError('Please enter an email address');
      return;
    }

    try {
      setIsSendingEmail(true);
      setEmailError(null);
      await sendTravelPlan(plan, email);
      setShowEmailModal(false);
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleBookFlight = (bookingToken: string) => {
    // Construct the booking URL with the booking token
    const bookingUrl = `https://www.kiwi.com/booking?token=${bookingToken}`;
    window.open(bookingUrl, '_blank');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getFlightTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'direct': 'Direct Flight',
      'one_stop': 'One Stop',
      'multi_stop': 'Multiple Stops'
    };
    return types[type] || type;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Trip Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{plan.summary.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary-500" />
            <span>{plan.summary.dates}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary-500" />
            <span>{plan.summary.travelers} travelers</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary-500" />
            <span>Budget: {plan.summary.totalBudget}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary-500" />
            <span>{plan.destination}</span>
          </div>
        </div>
      </motion.div>

      {/* Preparation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">Preparation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 flex items-center">
              <Luggage className="h-5 w-5 mr-2 text-primary-500" />
              Packing List
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {plan.preparation.packingList.map((item, index) => (
                <li key={index} className="text-gray-600">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2 flex items-center">
              <Info className="h-5 w-5 mr-2 text-primary-500" />
              Cultural Tips
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(plan.preparation.culturalTips).map(([key, value], index) => (
                <li key={index} className="text-gray-600">
                  <span className="font-medium">{key}:</span> {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Daily Itinerary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">Daily Itinerary</h2>
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {plan.days.map((day) => (
            <button
              key={day.day}
              onClick={() => setActiveDay(day.day)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeDay === day.day
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {plan.days
            .filter((day) => day.day === activeDay)
            .map((day) => (
              <div key={day.day} className="space-y-4">
                <h3 className="text-lg font-medium">{day.title}</h3>
                {day.activities.map((activity, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-primary-600">{activity.time}</h4>
                        <p className="text-gray-700">{activity.description}</p>
                      </div>
                      {activity.cost && (
                        <span className="text-sm font-medium text-gray-600">${activity.cost}</span>
                      )}
                    </div>
                    {activity.notes && (
                      <p className="text-sm text-gray-500 mt-2">{activity.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ))}
        </div>
      </motion.div>

      {/* Transportation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">Transportation</h2>
        <div className="space-y-4">
          {plan.transportation.localTransport.map((transport, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Bus className="h-5 w-5 text-primary-500" />
              <div>
                <h3 className="font-medium">{transport.type}</h3>
                <p className="text-gray-600">{transport.details}</p>
                <p className="text-sm text-gray-500">{transport.cost}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-primary-500" />
              Restaurants
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {plan.recommendations.restaurants.map((restaurant, index) => (
                <li key={index} className="text-gray-600">{restaurant}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary-500" />
              Booking Advice
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {plan.recommendations.bookingAdvice.map((advice, index) => (
                <li key={index} className="text-gray-600">{advice}</li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Flight Options - Right after Recommendations */}
      {plan.transportation?.betweenCities?.[0]?.options && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Plane className="h-6 w-6 mr-2 text-primary-500" />
              Available Flights
            </h2>
            <p className="mt-2 text-gray-600">
              {plan.transportation.betweenCities[0].route}
            </p>
          </div>

          <div className="p-6">
            {plan.transportation.betweenCities[0].options.map((flight, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{flight.airline}</h3>
                    <p className="text-sm text-gray-600">
                      {flight.departure} → {flight.arrival}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-600">
                      ${flight.price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Download PDF
        </button>
        <button
          onClick={() => setShowEmailModal(true)}
          className="px-6 py-3 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors flex items-center"
        >
          <Mail className="h-5 w-5 mr-2" />
          Send to Email
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
        >
          Create New Plan
        </button>
        <button
          onClick={() => {
            const saved = JSON.parse(localStorage.getItem('savedPlans') || '[]');
            saved.push(plan);
            localStorage.setItem('savedPlans', JSON.stringify(saved));
            alert('Plan saved!');
          }}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
        >
          Save Plan
        </button>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Send Travel Plan to Email</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full p-2 border rounded mb-4"
            />
            {emailError && (
              <p className="text-red-500 text-sm mb-4">{emailError}</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
              >
                {isSendingEmail ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelPlan;