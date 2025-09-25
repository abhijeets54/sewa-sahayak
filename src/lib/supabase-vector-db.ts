import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DocumentChunk, DocumentSource } from '@/types';
import { generateEmbedding } from './gemini';

export class SupabaseVectorDatabase {
  private supabase: SupabaseClient;
  private tableName: string = 'documents';

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async addDocuments(chunks: DocumentChunk[]) {
    try {
      console.log(`Processing ${chunks.length} chunks for Supabase...`);

      // Process chunks in batches to avoid overwhelming the API
      const batchSize = 10;
      const totalBatches = Math.ceil(chunks.length / batchSize);
      let processedCount = 0;

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} chunks)`);

        const documentsToInsert = [];

        for (const chunk of batch) {
          try {
            // Generate embedding for this chunk
            const embedding = await generateEmbedding(chunk.content);

            documentsToInsert.push({
              id: chunk.id,
              content: chunk.content,
              embedding: JSON.stringify(embedding), // Store as JSON string
              document_name: chunk.metadata.document,
              page_number: chunk.metadata.page,
              chunk_index: chunk.metadata.chunkIndex,
            });

            processedCount++;
          } catch (error) {
            console.error(`Failed to generate embedding for chunk ${chunk.id}:`, error);
            // Still insert without embedding
            documentsToInsert.push({
              id: chunk.id,
              content: chunk.content,
              embedding: null,
              document_name: chunk.metadata.document,
              page_number: chunk.metadata.page,
              chunk_index: chunk.metadata.chunkIndex,
            });
            processedCount++;
          }
        }

        // Insert batch into Supabase
        const { error } = await this.supabase
          .from(this.tableName)
          .insert(documentsToInsert);

        if (error) {
          console.error(`Error inserting batch ${batchNumber}:`, error);
          throw error;
        }

        // Small delay between batches
        if (i + batchSize < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log(`Successfully processed ${processedCount} documents to Supabase`);
    } catch (error) {
      console.error('Error adding documents to Supabase:', error);
      throw error;
    }
  }

  async searchSimilar(query: string, topK: number = 5): Promise<DocumentSource[]> {
    try {
      console.log(`Searching Supabase for: "${query}"`);

      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);
      const queryEmbeddingStr = JSON.stringify(queryEmbedding);

      // Use Supabase's vector similarity search
      const { data, error } = await this.supabase.rpc('search_documents', {
        query_embedding: queryEmbeddingStr,
        match_threshold: 0.1, // Minimum similarity threshold
        match_count: topK
      });

      if (error) {
        console.error('Error searching Supabase:', error);
        // Fallback to text search
        return await this.fallbackTextSearch(query, topK);
      }

      if (!data || data.length === 0) {
        console.log('No similar documents found, trying text search...');
        return await this.fallbackTextSearch(query, topK);
      }

      return data.map((item: any) => ({
        document: item.document_name,
        page: item.page_number,
        relevanceScore: 1 - item.distance, // Convert distance to similarity
        content: item.content,
      }));

    } catch (error) {
      console.error('Error in vector search:', error);
      // Fallback to text search
      return await this.fallbackTextSearch(query, topK);
    }
  }

  private async fallbackTextSearch(query: string, topK: number): Promise<DocumentSource[]> {
    console.log('Performing fallback text search...');

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .textSearch('content', query, {
        type: 'websearch',
        config: 'english'
      })
      .limit(topK);

    if (error) {
      console.error('Error in text search:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      document: item.document_name,
      page: item.page_number,
      relevanceScore: 0.5, // Fixed score for text search
      content: item.content,
    }));
  }

  async clearCollection() {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .neq('id', ''); // Delete all rows

      if (error) {
        throw error;
      }

      console.log('Supabase collection cleared successfully');
    } catch (error) {
      console.error('Error clearing Supabase collection:', error);
      throw error;
    }
  }

  async getCollectionInfo() {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return {
        name: `${this.tableName} (Supabase)`,
        count: count || 0,
      };
    } catch (error) {
      console.error('Error getting Supabase collection info:', error);
      throw error;
    }
  }
}