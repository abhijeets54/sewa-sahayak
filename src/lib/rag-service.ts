import { VectorDatabase } from './vector-db';
import { SupabaseVectorDatabase } from './supabase-vector-db';
import { generateResponse } from './gemini';
import { QueryResponse, DocumentSource } from '@/types';
import { config } from './config';

export class RAGService {
  private vectorDB: VectorDatabase | SupabaseVectorDatabase;

  constructor() {
    this.vectorDB = config.useSupabase ? new SupabaseVectorDatabase() : new VectorDatabase();
  }

  private createPrompt(query: string, sources: DocumentSource[]): string {
    // Filter sources with minimal relevance and sort by score
    const filteredSources = sources
      .filter(source => source.relevanceScore > -0.2) // More permissive threshold
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6); // Take top 6 sources

    const contextText = filteredSources
      .map((source, index) =>
        `Context ${index + 1} (from '${source.document}'${source.page ? `, Page ${source.page}` : ''}, Relevance: ${(source.relevanceScore * 100).toFixed(1)}%):\n${source.content}`
      )
      .join('\n\n---\n\n');

    return `You are "Seva Sahayak" - an expert AI assistant for Punjab Government services. Your task is to answer user questions based ONLY on the provided context from official documents.

IMPORTANT INSTRUCTIONS:
- The documents contain information in both English and Punjabi languages
- Extract and use ALL relevant information from the context, regardless of language
- If you find information in Punjabi text, translate it to English in your response
- Look for key information like: procedures, required documents, fees, timelines, office addresses, contact details
- If the answer is partially available, provide what information you can find and specify what's missing
- Be thorough - check ALL context sections for relevant information
- Provide step-by-step procedures when available
- Include specific details like fees, required documents, and office locations
- After providing the answer, cite your sources using the exact format: [Source: Document Name, Page X]

CONTEXT AVAILABLE (${filteredSources.length} sources found):
---
${contextText}
---

USER QUESTION: ${query}

DETAILED ANSWER (extract all relevant information from the context):`;
  }

  private generateQueryVariations(query: string): string[] {
    const variations = [query];

    // Add common variations for government services
    const lowerQuery = query.toLowerCase();

    // Residence/Domicile certificates
    if (lowerQuery.includes('residence') || lowerQuery.includes('domicile')) {
      variations.push('domicile certificate Punjab', 'residence proof certificate', 'address certificate', 'residence certificate application', 'domicile proof');
    }

    // Income certificates
    if (lowerQuery.includes('income')) {
      variations.push('income proof certificate', 'income certificate application', 'income verification', 'income proof', 'salary certificate');
    }

    // Caste certificates
    if (lowerQuery.includes('caste') || lowerQuery.includes('sc') || lowerQuery.includes('obc') || lowerQuery.includes('bc')) {
      variations.push('SC certificate', 'OBC certificate', 'BC certificate', 'scheduled caste certificate', 'caste proof', 'scheduled tribe certificate', 'ST certificate');
    }

    // Senior citizen cards
    if (lowerQuery.includes('senior') || lowerQuery.includes('elderly')) {
      variations.push('senior citizen card', 'elderly citizen identity', 'senior citizen identity card', 'old age card');
    }

    // Birth certificates
    if (lowerQuery.includes('birth')) {
      variations.push('birth certificate', 'birth proof', 'date of birth certificate', 'birth registration');
    }

    // Death certificates
    if (lowerQuery.includes('death')) {
      variations.push('death certificate', 'death proof', 'death registration', 'mortality certificate');
    }

    // General application process queries
    if (lowerQuery.includes('apply') || lowerQuery.includes('application')) {
      variations.push('application process', 'how to apply', 'application form', 'online application', 'application procedure');
    }

    // Fee-related queries
    if (lowerQuery.includes('fee') || lowerQuery.includes('cost') || lowerQuery.includes('charge')) {
      variations.push('fees', 'cost', 'charges', 'government fee', 'facilitation fee', 'total fee');
    }

    // Document-related queries
    if (lowerQuery.includes('document') || lowerQuery.includes('requirement')) {
      variations.push('required documents', 'necessary documents', 'document list', 'paperwork required');
    }

    return variations;
  }

  async query(userQuery: string): Promise<QueryResponse> {
    try {
      console.log(`Processing query: ${userQuery}`);

      // Step 1: Generate query variations for better matching (limit to reduce API calls)
      const queryVariations = this.generateQueryVariations(userQuery);

      // Limit variations to reduce API calls for free tier
      const limitedVariations = queryVariations.slice(0, 3); // Only use first 3 variations

      console.log(`Using ${limitedVariations.length} query variations to stay within API limits`);

      // Step 2: Search with limited variations and combine results
      const allSources: DocumentSource[] = [];

      for (const variation of limitedVariations) {
        const sources = await this.vectorDB.searchSimilar(variation, config.topKResults);
        allSources.push(...sources);
      }

      // Remove duplicates and sort by relevance score
      const uniqueSources = Array.from(
        new Map(allSources.map(source => [source.content, source])).values()
      ).sort((a, b) => b.relevanceScore - a.relevanceScore);

      if (uniqueSources.length === 0) {
        return {
          answer: "I don't have enough information from the provided documents to answer your question. Please try rephrasing your question or contact the relevant government office directly.",
          sources: [],
          timestamp: new Date(),
        };
      }

      console.log(`Found ${uniqueSources.length} relevant sources from ${limitedVariations.length} query variations`);

      // Step 3: Generate prompt with context
      const prompt = this.createPrompt(userQuery, uniqueSources);

      // Step 4: Generate response using Gemini
      const answer = await generateResponse(prompt);

      return {
        answer,
        sources: uniqueSources.slice(0, 8), // Return top sources for citation
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('Error in RAG query:', error);
      throw new Error('Failed to process your question. Please try again.');
    }
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const collectionInfo = await this.vectorDB.getCollectionInfo();

      return {
        status: 'healthy',
        details: {
          vectorDatabase: 'connected',
          documentsCount: collectionInfo.count,
          collectionName: collectionInfo.name,
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          vectorDatabase: 'disconnected',
        }
      };
    }
  }
}