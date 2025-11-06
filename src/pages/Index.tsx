import { useState } from 'react';
import { Cloud, DollarSign, Quote } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeatherModule } from '@/components/WeatherModule';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { QuoteGenerator } from '@/components/QuoteGenerator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            InfoHub
          </h1>
          <p className="text-muted-foreground mt-2">
            Your daily utilities in one place
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Tabs defaultValue="weather" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 mb-8 bg-card/50 backdrop-blur-sm">
            <TabsTrigger 
              value="weather" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Cloud className="h-4 w-4" />
              <span className="hidden sm:inline">Weather</span>
            </TabsTrigger>
            <TabsTrigger 
              value="currency" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground transition-all"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Converter</span>
            </TabsTrigger>
            <TabsTrigger 
              value="quote" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all"
            >
              <Quote className="h-4 w-4" />
              <span className="hidden sm:inline">Quotes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weather" className="mt-0">
            <WeatherModule />
          </TabsContent>

          <TabsContent value="currency" className="mt-0">
            <CurrencyConverter />
          </TabsContent>

          <TabsContent value="quote" className="mt-0">
            <QuoteGenerator />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Built with React, TypeScript & Lovable Cloud</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;