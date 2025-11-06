import { useState, useEffect } from 'react';
import { Quote, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuoteData {
  quote: string;
  author: string;
}

export const QuoteGenerator = () => {
  const [data, setData] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuote = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quote`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quote');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Quote fetch error:', err);
      setError(err instanceof Error ? err.message : 'Could not fetch quote');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

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
      {data && (
        <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl p-12 shadow-card border border-border min-h-[300px] flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-center">
            <Quote className="h-12 w-12 text-primary mb-6 opacity-50" />
            
            <blockquote className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed mb-8">
              "{data.quote}"
            </blockquote>

            <p className="text-xl text-muted-foreground font-medium">
              — {data.author}
            </p>
          </div>

          <div className="flex justify-center mt-8">
            <Button onClick={fetchQuote} size="lg" className="gap-2">
              <RefreshCw className="h-5 w-5" />
              Get New Quote
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};