import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Basic mapping from Open-Meteo weather codes to labels and OpenWeather-like icon ids
const weatherCodeMap: Record<number, { text: string; icon: string }> = {
  0: { text: 'Clear sky', icon: '01d' },
  1: { text: 'Mainly clear', icon: '02d' },
  2: { text: 'Partly cloudy', icon: '02d' },
  3: { text: 'Overcast', icon: '04d' },
  45: { text: 'Fog', icon: '50d' },
  48: { text: 'Depositing rime fog', icon: '50d' },
  51: { text: 'Light drizzle', icon: '09d' },
  53: { text: 'Moderate drizzle', icon: '09d' },
  55: { text: 'Dense drizzle', icon: '09d' },
  56: { text: 'Freezing drizzle', icon: '09d' },
  57: { text: 'Dense freezing drizzle', icon: '09d' },
  61: { text: 'Slight rain', icon: '10d' },
  63: { text: 'Rain', icon: '10d' },
  65: { text: 'Heavy rain', icon: '10d' },
  66: { text: 'Freezing rain', icon: '10d' },
  67: { text: 'Heavy freezing rain', icon: '10d' },
  71: { text: 'Slight snow fall', icon: '13d' },
  73: { text: 'Snow fall', icon: '13d' },
  75: { text: 'Heavy snow fall', icon: '13d' },
  77: { text: 'Snow grains', icon: '13d' },
  80: { text: 'Rain showers', icon: '09d' },
  81: { text: 'Heavy rain showers', icon: '09d' },
  82: { text: 'Violent rain showers', icon: '09d' },
  85: { text: 'Snow showers', icon: '13d' },
  86: { text: 'Heavy snow showers', icon: '13d' },
  95: { text: 'Thunderstorm', icon: '11d' },
  96: { text: 'Thunderstorm with hail', icon: '11d' },
  99: { text: 'Thunderstorm with heavy hail', icon: '11d' },
};

const mapWeather = (code: number) => weatherCodeMap[code] ?? { text: 'Unknown', icon: '04d' };

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const city = url.searchParams.get('city') || 'London';
    
    const rawKey = Deno.env.get('OPENWEATHER_API_KEY') || '';
    const apiKey = rawKey.trim();
    
    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY is not set or empty');
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
      const errorText = await weatherResponse.text();
      console.error('OpenWeather API error:', weatherResponse.status, errorText);

      // Fallback to Open-Meteo (no API key required)
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
        );
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.results && geo.results.length > 0) {
            const g = geo.results[0];
            const lat = g.latitude;
            const lon = g.longitude;
            const meteoRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
            );
            if (meteoRes.ok) {
              const meteo = await meteoRes.json();
              const code = Number(meteo.current.weather_code);
              const mapped = mapWeather(code);
              const result = {
                city: `${g.name}${g.country_code ? ', ' + g.country_code : ''}`,
                temperature: Math.round(meteo.current.temperature_2m),
                condition: mapped.text,
                description: mapped.text,
                humidity: meteo.current.relative_humidity_2m,
                windSpeed: meteo.current.wind_speed_10m,
                icon: mapped.icon,
              };
              console.log('Weather data fetched via Open-Meteo fallback:', result);
              return new Response(
                JSON.stringify(result),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        }
      } catch (e) {
        console.error('Open-Meteo fallback failed:', e);
      }

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