import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export const WeatherModule = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState('London');
  const [searchCity, setSearchCity] = useState('');

  const fetchWeather = async (cityName: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const url = new URL(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weather`
      );
      url.searchParams.append('city', cityName);

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch weather data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err.message : 'Could not fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setCity(searchCity);
      fetchWeather(searchCity);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter city name..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Search</Button>
      </form>

      {data && (
        <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-card border border-border">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2">{data.city}</h2>
              <p className="text-muted-foreground capitalize">{data.description}</p>
            </div>
            <img 
              src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
              alt={data.condition}
              className="w-20 h-20"
            />
          </div>

          <div className="text-6xl font-bold text-primary mb-8">
            {data.temperature}°C
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <Cloud className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Condition</p>
                <p className="font-semibold">{data.condition}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <Droplets className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="font-semibold">{data.humidity}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <Wind className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Wind</p>
                <p className="font-semibold">{data.windSpeed} m/s</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};