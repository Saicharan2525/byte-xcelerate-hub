import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const amountParam = url.searchParams.get('amount');
    const amount = parseFloat(amountParam || '100');

    if (isNaN(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount. Please provide a positive number.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Converting ${amount} INR to USD and EUR`);

    // Using frankfurter.app - free and doesn't require API key
    const currencyResponse = await fetch(
      `https://api.frankfurter.app/latest?from=INR&to=USD,EUR`
    );

    if (!currencyResponse.ok) {
      console.error('Currency API error:', currencyResponse.status);
      return new Response(
        JSON.stringify({ error: 'Could not fetch exchange rates' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const currencyData = await currencyResponse.json();

    const result = {
      inr: amount,
      usd: parseFloat((amount * currencyData.rates.USD).toFixed(2)),
      eur: parseFloat((amount * currencyData.rates.EUR).toFixed(2)),
      rates: {
        usd: currencyData.rates.USD,
        eur: currencyData.rates.EUR,
      },
      date: currencyData.date,
    };

    console.log('Currency conversion successful:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in currency function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred during conversion' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});