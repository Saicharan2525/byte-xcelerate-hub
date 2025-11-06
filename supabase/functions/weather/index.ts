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
    const city = url.searchParams.get('city') || 'London';
    
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching weather for city: ${city}`);
    
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.text();
      console.error('OpenWeather API error:', weatherResponse.status, errorData);
      return new Response(
        JSON.stringify({ error: 'Could not fetch weather data. Please check the city name.' }),
        { 
          status: weatherResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const weatherData = await weatherResponse.json();

    const result = {
      city: weatherData.name,
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      icon: weatherData.weather[0].icon,
    };

    console.log('Weather data fetched successfully:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in weather function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred while fetching weather data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});