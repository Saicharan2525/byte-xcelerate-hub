import { useState, useEffect } from 'react';
import { DollarSign, Euro, IndianRupee, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CurrencyData {
  inr: number;
  usd: number;
  eur: number;
  rates: {
    usd: number;
    eur: number;
  };
  date: string;
}

export const CurrencyConverter = () => {
  const [data, setData] = useState<CurrencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('100');

  const fetchCurrency = async (inrAmount: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const url = new URL(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/currency`
      );
      url.searchParams.append('amount', inrAmount);

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch currency data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Currency fetch error:', err);
      setError(err instanceof Error ? err.message : 'Could not fetch exchange rates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrency(amount);
  }, []);

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      fetchCurrency(amount);
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
      <form onSubmit={handleConvert} className="flex gap-2">
        <Input
          type="number"
          placeholder="Enter amount in INR..."
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
          className="flex-1"
        />
        <Button type="submit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Convert
        </Button>
      </form>

      {data && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-card border border-border">
            <div className="flex items-center gap-3 mb-6">
              <IndianRupee className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Indian Rupee</p>
                <p className="text-4xl font-bold text-foreground">₹{data.inr.toFixed(2)}</p>
              </div>
            </div>

            <div className="h-px bg-border mb-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">US Dollar</p>
                    <p className="text-2xl font-bold">${data.usd.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Rate</p>
                  <p className="text-sm font-medium">{data.rates.usd.toFixed(4)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Euro className="h-6 w-6 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Euro</p>
                    <p className="text-2xl font-bold">€{data.eur.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Rate</p>
                  <p className="text-sm font-medium">{data.rates.eur.toFixed(4)}</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Exchange rates updated on {new Date(data.date).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};