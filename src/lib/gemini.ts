import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';
import { embeddingRateLimiter, generationRateLimiter } from './rate-limiter';

if (!config.googleApiKey) {
  throw new Error('GOOGLE_API_KEY is not configured');
}

const genAI = new GoogleGenerativeAI(config.googleApiKey);

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Wait for rate limiter before making request
    await embeddingRateLimiter.waitForAvailability();

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    let retries = 3;
    let lastError: Error | null = null;

    while (retries > 0) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'models/gemini-embedding-001',
              content: {
                parts: [{ text }],
              },
              output_dimensionality: 768, // Recommended dimension
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          lastError = new Error(`API Error: ${error.error?.message || response.statusText}`);
          
          // Retry on server errors, not client errors
          if (response.status >= 500) {
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
              continue;
            }
          }
          throw lastError;
        }

        const data = await response.json();

        if (!data.embedding?.values || data.embedding.values.length === 0) {
          throw new Error('No embedding values received from API');
        }

        return data.embedding.values;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retries--;
        
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    throw lastError || new Error('Failed to generate embedding after retries');
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateResponseWithGroq(prompt: string): Promise<string> {
  try {
    // Wait for rate limiter before making request
    await generationRateLimiter.waitForAvailability();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    let retries = 3;
    let lastError: Error | null = null;

    while (retries > 0) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant', // Free tier compatible, very fast
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          lastError = new Error(`API Error: ${error.error?.message || response.statusText}`);
          
          // Retry on server errors
          if (response.status >= 500) {
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
              continue;
            }
          }
          throw lastError;
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
          throw new Error('No response content received from Groq API');
        }

        return data.choices[0].message.content;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retries--;
        
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    throw lastError || new Error('Failed to generate response using Groq after retries');
  } catch (error) {
    console.error('Error generating response with Groq:', error);
    throw new Error('Failed to generate response');
  }
}

export async function generateResponse(prompt: string): Promise<string> {
  try {
    // Wait for rate limiter before making request
    await generationRateLimiter.waitForAvailability();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No text response received from model');
    }

    return text;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}