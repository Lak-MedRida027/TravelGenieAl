import { TravelFormData, TravelPlan } from '../types';

const API_BASE_URL = 'http://localhost:8001';

// Country name to airport code mapping
const countryToISO: { [key: string]: string } = {
  // Common countries
  'United States': 'JFK',
  'USA': 'JFK',
  'US': 'JFK',
  'United Kingdom': 'LHR',
  'UK': 'LHR',
  'UAE': 'DXB',
  'United Arab Emirates': 'DXB',
  'France': 'CDG',
  'Germany': 'FRA',
  'Italy': 'FCO',
  'Spain': 'MAD',
  'Japan': 'NRT',
  'China': 'PEK',
  'India': 'DEL',
  'Australia': 'SYD',
  'Canada': 'YYZ',
  'Mexico': 'MEX',
  'Brazil': 'GRU',
  'Russia': 'SVO',
  'South Korea': 'ICN',
  'Singapore': 'SIN',
  'Thailand': 'BKK',
  'Vietnam': 'HAN',
  'Indonesia': 'CGK',
  'Malaysia': 'KUL',
  'Philippines': 'MNL',
  'New Zealand': 'AKL',
  'South Africa': 'JNB',
  'Egypt': 'CAI',
  'Turkey': 'IST',
  'Greece': 'ATH',
  'Netherlands': 'AMS',
  'Belgium': 'BRU',
  'Switzerland': 'ZRH',
  'Sweden': 'ARN',
  'Norway': 'OSL',
  'Denmark': 'CPH',
  'Finland': 'HEL',
  'Poland': 'WAW',
  'Portugal': 'LIS',
  'Ireland': 'DUB',
  'Austria': 'VIE',
  'Hungary': 'BUD',
  'Czech Republic': 'PRG',
  'Slovakia': 'BTS',
  'Croatia': 'ZAG',
  'Serbia': 'BEG',
  'Romania': 'OTP',
  'Bulgaria': 'SOF',
  'Ukraine': 'KBP',
  'Belarus': 'MSQ',
  'Kazakhstan': 'NQZ',
  'Uzbekistan': 'TAS',
  'Pakistan': 'ISB',
  'Bangladesh': 'DAC',
  'Sri Lanka': 'CMB',
  'Nepal': 'KTM',
  'Maldives': 'MLE',
  'Cambodia': 'PNH',
  'Laos': 'VTE',
  'Myanmar': 'RGN',
  'Brunei': 'BWN',
  'Timor-Leste': 'DIL',
  'Papua New Guinea': 'POM',
  'Fiji': 'NAN',
  'Samoa': 'APW',
  'Tonga': 'TBU',
  'Vanuatu': 'VLI',
  'Solomon Islands': 'HIR',
  'Marshall Islands': 'MAJ',
  'Micronesia': 'PNI',
  'Palau': 'ROR',
  'Nauru': 'INU',
  'Kiribati': 'TRW',
  'Tuvalu': 'FUN',
  'Cook Islands': 'RAR',
  'Niue': 'IUE',
  'Tokelau': 'NKL',
  'American Samoa': 'PPG',
  'Guam': 'GUM',
  'Northern Mariana Islands': 'SPN',
  'Puerto Rico': 'SJU',
  'U.S. Virgin Islands': 'STT',
  'British Virgin Islands': 'EIS',
  'Anguilla': 'AXA',
  'Montserrat': 'MNI',
  'Cayman Islands': 'GCM',
  'Turks and Caicos Islands': 'PLS',
  'Bermuda': 'BDA',
  'Aruba': 'AUA',
  'Curaçao': 'CUR',
  'Sint Maarten': 'SXM',
  'Bonaire': 'BON',
  'Saba': 'SAB',
  'Sint Eustatius': 'EUX',
  'Saint Martin': 'SFG',
  'Saint Barthélemy': 'SBH',
  'Saint Pierre and Miquelon': 'FSP',
  'Greenland': 'GOH',
  'Faroe Islands': 'FAE',
  'Åland Islands': 'MHQ',
  'Isle of Man': 'IOM',
  'Jersey': 'JER',
  'Guernsey': 'GCI',
  'Gibraltar': 'GIB',
  'Malta': 'MLA',
  'Cyprus': 'LCA',
  'Iceland': 'KEF',
  'Luxembourg': 'LUX',
  'Liechtenstein': 'ZRH',
  'Monaco': 'MCM',
  'San Marino': 'RMI',
  'Vatican City': 'FCO',
  'Andorra': 'LEU',
  'Moldova': 'KIV',
  'Albania': 'TIA',
  'North Macedonia': 'SKP',
  'Kosovo': 'PRN',
  'Montenegro': 'TGD',
  'Bosnia and Herzegovina': 'SJJ',
  'Slovenia': 'LJU',
  'Estonia': 'TLL',
  'Latvia': 'RIX',
  'Lithuania': 'VNO',
  'Armenia': 'EVN',
  'Azerbaijan': 'GYD',
  'Georgia': 'TBS',
  'Kyrgyzstan': 'FRU',
  'Tajikistan': 'DYU',
  'Turkmenistan': 'ASB',
  'Afghanistan': 'KBL',
  'Iran': 'IKA',
  'Iraq': 'BGW',
  'Syria': 'DAM',
  'Lebanon': 'BEY',
  'Jordan': 'AMM',
  'Israel': 'TLV',
  'Palestine': 'GZA',
  'Saudi Arabia': 'RUH',
  'Yemen': 'SAH',
  'Oman': 'MCT',
  'Qatar': 'DOH',
  'Bahrain': 'BAH',
  'Kuwait': 'KWI',
  'Morocco': 'CMN',
  'Algeria': 'ALG',
  'Tunisia': 'TUN',
  'Libya': 'TIP',
  'Sudan': 'KRT',
  'South Sudan': 'JUB',
  'Ethiopia': 'ADD',
  'Eritrea': 'ASM',
  'Djibouti': 'JIB',
  'Somalia': 'MGQ',
  'Kenya': 'NBO',
  'Uganda': 'EBB',
  'Rwanda': 'KGL',
  'Burundi': 'BJM',
  'Tanzania': 'DAR',
  'Mozambique': 'MPM',
  'Malawi': 'LLW',
  'Zambia': 'LUN',
  'Zimbabwe': 'HRE',
  'Botswana': 'GBE',
  'Namibia': 'WDH',
  'Angola': 'LAD',
  'Democratic Republic of the Congo': 'FIH',
  'Republic of the Congo': 'BZV',
  'Gabon': 'LBV',
  'Equatorial Guinea': 'SSG',
  'Cameroon': 'NSI',
  'Nigeria': 'LOS',
  'Niger': 'NIM',
  'Chad': 'NDJ',
  'Mali': 'BKO',
  'Burkina Faso': 'OUA',
  'Senegal': 'DKR',
  'Gambia': 'BJL',
  'Guinea-Bissau': 'OXB',
  'Guinea': 'CKY',
  'Sierra Leone': 'FNA',
  'Liberia': 'ROB',
  'Côte d\'Ivoire': 'ABJ',
  'Ghana': 'ACC',
  'Togo': 'LFW',
  'Benin': 'COO',
  'Central African Republic': 'BGF',
  'São Tomé and Príncipe': 'TMS',
  'Cape Verde': 'RAI',
  'Mauritania': 'NKC',
  'Western Sahara': 'VIL',
  'Comoros': 'HAH',
  'Seychelles': 'SEZ',
  'Mauritius': 'MRU',
  'Madagascar': 'TNR',
  'Réunion': 'RUN',
  'Mayotte': 'DZA',
  'French Guiana': 'CAY',
  'French Polynesia': 'PPT',
  'New Caledonia': 'NOU',
  'Wallis and Futuna': 'WLS',
  'French Southern Territories': 'TLS',
  'Saint Helena': 'HLE',
  'Ascension Island': 'ASI',
  'Tristan da Cunha': 'TDC',
  'Falkland Islands': 'MPN',
  'South Georgia and the South Sandwich Islands': 'GRY',
  'Antarctica': 'NZWD',
  'Bouvet Island': 'BVT',
  'Heard Island and McDonald Islands': 'HIM',
  'Christmas Island': 'XCH',
  'Cocos (Keeling) Islands': 'CCK',
  'Norfolk Island': 'NLK',
  'Pitcairn Islands': 'PIT',
  'United States Minor Outlying Islands': 'UMI',
  'Midway Islands': 'MDY',
  'Wake Island': 'AWK',
  'Johnston Atoll': 'JON',
  'Baker Island': 'BKN',
  'Howland Island': 'HWL',
  'Jarvis Island': 'JAR',
  'Kingman Reef': 'KRM',
  'Palmyra Atoll': 'PLY',
  'Navassa Island': 'NVS',
  'Bajo Nuevo Bank': 'BNB',
  'Serranilla Bank': 'SRB',
  'Clipperton Island': 'CPT',
  'Ashmore and Cartier Islands': 'ACI',
  'Coral Sea Islands': 'CSI',
  'Australian Antarctic Territory': 'AAT',
  'Ross Dependency': 'RDP',
  'Peter I Island': 'PII',
  'Queen Maud Land': 'QML',
  'British Indian Ocean Territory': 'BIOT',
  'Akrotiri and Dhekelia': 'AKT',
  'Svalbard and Jan Mayen': 'SJM',
  'Jan Mayen': 'JAN',
  'Svalbard': 'SVA',
  'Macau': 'MFM',
  'Hong Kong': 'HKG',
  'Taiwan': 'TPE',
  'Northern Cyprus': 'ECN',
  'Abkhazia': 'SUI',
  'South Ossetia': 'TKV',
  'Nagorno-Karabakh': 'LWN',
  'Transnistria': 'TIR',
  'Somaliland': 'HGA',
  'Sahrawi Arab Democratic Republic': 'EUN',
  'Republic of Artsakh': 'LWN',
  'Donetsk People\'s Republic': 'DOK',
  'Luhansk People\'s Republic': 'LUG',
  'Crimea': 'SIP',
  'Northern Ireland': 'BFS',
  'Scotland': 'EDI',
  'Wales': 'CWL',
  'England': 'LHR',
  'Great Britain': 'LHR',
  'British Isles': 'LHR',
  'Channel Islands': 'GCI'
};

// Function to convert country name to ISO code
const getCountryISO = (countryName: string): string => {
  const normalizedName = countryName.trim().toLowerCase();
  
  // First try exact match
  const exactMatch = countryToISO[countryName];
  if (exactMatch) return exactMatch;
  
  // Then try case-insensitive match
  for (const [key, value] of Object.entries(countryToISO)) {
    if (key.toLowerCase() === normalizedName) {
      return value;
    }
  }
  
  // If no match found, return the original string
  console.warn(`No ISO code found for country: ${countryName}`);
  return countryName;
};

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

interface TravelPlanResponse {
  plan: TravelPlan;
  flightOptions: FlightOptions;
}

export const generateTravelPlan = async (formData: TravelFormData): Promise<TravelPlanResponse> => {
  try {
    // Format dates to YYYY-MM-DD
    const startDate = formData.startDate ? formData.startDate.toISOString().split('T')[0] : undefined;
    const endDate = formData.endDate ? formData.endDate.toISOString().split('T')[0] : undefined;

    // Convert country names to ISO codes
    const sourceISO = getCountryISO(formData.source);
    const destinationISO = getCountryISO(formData.destination);

    // Prepare request body
    const requestBody = {
      source: sourceISO,
      destination: destinationISO,
      departure_date: startDate,
      return_date: endDate,
      budget: Number(formData.budget),
      travelers: Number(formData.travelers),
      interests: formData.interests,
      hotel_preferences: {
        max_price: 300,
        min_rating: 4,
        amenities: ["pool", "wifi", "breakfast"]
      }
    };

    console.log('Sending request to API:', requestBody);

    const response = await fetch(`${API_BASE_URL}/generate-travel-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error('Failed to generate travel plan');
    }

    const { travel_plan } = data;
    
    // Transform the API response to match our TravelPlan type
    const travelPlan: TravelPlan = {
      destination: formData.destination,
      summary: {
        title: travel_plan.trip_overview.title,
        dates: travel_plan.trip_overview.dates,
        travelers: travel_plan.trip_overview.travelers,
        totalBudget: travel_plan.trip_overview.total_budget,
        interests: travel_plan.trip_overview.interests
      },
      preparation: {
        packingList: travel_plan.preparation.packing_list,
        culturalTips: travel_plan.preparation.cultural_tips
      },
      days: travel_plan.daily_itinerary.map((day: any) => ({
        day: day.day,
        date: day.date,
        title: day.title,
        activities: day.activities.map((activity: any) => ({
          time: activity.time,
          description: activity.description,
          cost: activity.cost,
          notes: activity.notes
        }))
      })),
      transportation: {
        betweenCities: travel_plan.transportation_summary.between_cities,
        localTransport: travel_plan.transportation_summary.local_transport
      },
      budget: {
        totalEstimatedCost: travel_plan.budget_breakdown.total_estimated_cost,
        note: travel_plan.budget_breakdown.note
      },
      recommendations: {
        restaurants: travel_plan.recommendations.restaurants,
        bookingAdvice: travel_plan.recommendations.booking_advice
      },
      flights: travel_plan.transportation_summary.between_cities
        .filter((transport: any) => transport.type === 'Flight')
        .flatMap((flight: any) => flight.options),
      source: formData.source,
      startDate: formData.startDate
    };

    // Extract flight options from transportation_summary
    const flightOptions: FlightOptions = {
      options: travel_plan.transportation_summary.between_cities
        .filter((transport: any) => transport.type === 'Flight')
        .flatMap((flight: any) => 
          flight.options.map((option: any) => ({
            flights: [{
              airline: option.airline,
              departure: option.departure,
              arrival: option.arrival,
              price: option.price
            }],
            layovers: [],
            total_duration: 0, // This would need to be calculated if available
            carbon_emissions: {
              this_flight: 0, // This would need to be provided by the API
              typical_for_this_route: 0,
              difference_percent: 0
            },
            price: parseFloat(option.price),
            type: 'direct', // Assuming direct flights unless specified otherwise
            airline_logo: '', // This would need to be provided by the API
            booking_token: '' // This would need to be provided by the API
          }))
        )
    };

    return {
      plan: travelPlan,
      flightOptions
    };
  } catch (error) {
    console.error('Error generating travel plan:', error);
    throw error;
  }
};

export const sendTravelPlan = async (travelPlan: TravelPlan, recipientEmail: string): Promise<void> => {
  try {
    // Format the travel plan data to match the expected structure
    const formattedPlan = {
      travel_plan: {
        trip_overview: {
          title: travelPlan.summary.title,
          dates: travelPlan.summary.dates,
          travelers: travelPlan.summary.travelers,
          total_budget: travelPlan.summary.totalBudget,
          interests: travelPlan.summary.interests
        },
        preparation: {
          packing_list: travelPlan.preparation.packingList,
          cultural_tips: travelPlan.preparation.culturalTips
        },
        daily_itinerary: travelPlan.days.map(day => {
          // Calculate totals for each time period
          const timeTotals = {
            Morning: 0,
            Afternoon: 0,
            Evening: 0
          };

          // Calculate totals
          day.activities.forEach(activity => {
            const cost = parseInt(activity.cost) || 0;
            timeTotals[activity.time as keyof typeof timeTotals] += cost;
          });

          return {
            day: day.day,
            date: day.date,
            title: day.title,
            activities: day.activities.map(activity => ({
              time: activity.time,
              description: activity.description,
              cost: activity.cost ? `$${activity.cost}` : '$0',
              notes: activity.notes,
              time_total: `$${timeTotals[activity.time as keyof typeof timeTotals]}`
            }))
          };
        }),
        transportation_summary: {
          between_cities: travelPlan.transportation.betweenCities,
          local_transport: travelPlan.transportation.localTransport
        },
        budget_breakdown: {
          total_estimated_cost: travelPlan.budget.totalEstimatedCost,
          note: travelPlan.budget.note
        },
        recommendations: {
          restaurants: travelPlan.recommendations.restaurants,
          booking_advice: travelPlan.recommendations.bookingAdvice
        }
      },
      flight_options: {
        note: "Flight options for travelers",
        options: []
      },
      hotel_options: {
        note: "Hotel options",
        options: []
      },
      status: "success"
    };

    const response = await fetch(`${API_BASE_URL}/send-travel-plan?recipient_email=${encodeURIComponent(recipientEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedPlan),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Server response:', errorData);
      throw new Error(`Failed to send travel plan: ${errorData?.message || response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending travel plan:', error);
    throw error;
  }
}; 