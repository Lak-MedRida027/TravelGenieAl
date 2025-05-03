const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface FlightSearchParams {
  departure_id: string;
  arrival_id: string;
  outbound_date: string;
  serpapi_key: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { departure_id, arrival_id, outbound_date, serpapi_key }: FlightSearchParams = await req.json();

    // Validate required parameters
    if (!departure_id || !arrival_id || !outbound_date || !serpapi_key) {
      throw new Error('Missing required parameters');
    }

    // Validate airport codes
    if (!/^[A-Z]{3}$/.test(departure_id) || !/^[A-Z]{3}$/.test(arrival_id)) {
      throw new Error('Invalid airport codes');
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(outbound_date)) {
      throw new Error('Invalid date format');
    }

    const params = new URLSearchParams({
      engine: 'google_flights',
      type: '2',
      departure_id,
      arrival_id,
      outbound_date,
      currency: 'USD',
      hl: 'en',
      api_key: serpapi_key
    });

    const serpApiUrl = `https://serpapi.com/search.json?${params}`;

    const response = await fetch(serpApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SerpAPI request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // Validate SerpAPI response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response from SerpAPI');
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error: unknown) {
    console.error('Edge function error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        status: 'error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});