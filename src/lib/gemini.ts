import { GoogleGenAI } from '@google/genai';
import { config } from './config';

if (!config.googleApiKey) {
  throw new Error('GOOGLE_API_KEY is not configured');
}

const genAI = new GoogleGenAI({
  apiKey: config.googleApiKey,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await genAI.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });

    if (!response.embeddings || response.embeddings.length === 0) {
      throw new Error('No embeddings received from model');
    }

    const embedding = response.embeddings[0];
    if (!embedding.values) {
      throw new Error('No embedding values received from model');
    }

    return embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateResponse(prompt: string): Promise<string> {
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('No text response received from model');
    }

    return response.text;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}