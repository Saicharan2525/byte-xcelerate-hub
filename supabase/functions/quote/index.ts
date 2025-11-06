import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback quotes in case API is down
const fallbackQuotes = [
  {
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    content: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    content: "Stay hungry, stay foolish.",
    author: "Steve Jobs"
  },
  {
    content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    content: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching random motivational quote');

    // Using quotable.io - free and doesn't require API key
    const quoteResponse = await fetch('https://api.quotable.io/random?tags=inspirational');

    let quoteData;

    if (quoteResponse.ok) {
      quoteData = await quoteResponse.json();
      console.log('Quote fetched from API:', quoteData);
    } else {
      // Use fallback quotes if API fails
      console.log('API failed, using fallback quotes');
      const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
      quoteData = fallbackQuotes[randomIndex];
    }

    const result = {
      quote: quoteData.content,
      author: quoteData.author,
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in quote function:', error);
    
    // Return a fallback quote on error
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    const fallbackQuote = fallbackQuotes[randomIndex];
    
    return new Response(
      JSON.stringify({
        quote: fallbackQuote.content,
        author: fallbackQuote.author,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});