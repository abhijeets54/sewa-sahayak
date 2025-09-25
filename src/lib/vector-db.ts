import { ChromaClient } from 'chromadb';
import { DocumentChunk, DocumentSource } from '@/types';
import { generateEmbedding } from './gemini';
import { config } from './config';

export class VectorDatabase {
  private client: ChromaClient;
  private collectionName: string = 'seva-sahayak-documents';
  private memoryData: Map<string, DocumentChunk> = new Map();
  private isUsingMemory: boolean = false;

  constructor() {
    // Try ChromaDB server first, fall back to in-memory storage
    this.client = new ChromaClient({
      path: `http://${config.chromaHost}:${config.chromaPort}`,
    });
  }

  async initializeCollection() {
    try {
      // Use getOrCreateCollection which doesn't require embeddingFunction for existing collections
      const collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: 'Punjab Government Services Documents' },
      });
      console.log('Initialized ChromaDB collection:', this.collectionName);
      return collection;
    } catch (error) {
      console.warn('ChromaDB server not available, using in-memory storage:', error.message);
      this.isUsingMemory = true;
      return null; // Will use memory-based operations
    }
  }

  async addDocuments(chunks: DocumentChunk[]) {
    try {
      const collection = await this.initializeCollection();

      if (this.isUsingMemory) {
        // Store in memory with embeddings
        console.log(`Storing ${chunks.length} chunks in memory with embeddings...`);
        for (const chunk of chunks) {
          try {
            const embedding = await generateEmbedding(chunk.content);
            chunk.embedding = embedding;
            this.memoryData.set(chunk.id, chunk);
          } catch (error) {
            console.error(`Failed to generate embedding for chunk ${chunk.id}:`, error);
            // Store without embedding as fallback
            this.memoryData.set(chunk.id, chunk);
          }
        }
        console.log(`Successfully stored ${chunks.length} documents in memory`);
        return;
      }

      // Process chunks in batches to avoid overwhelming the API
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < chunks.length; i += batchSize) {
        batches.push(chunks.slice(i, i + batchSize));
      }

      console.log(`Processing ${chunks.length} chunks in ${batches.length} batches`);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processing batch ${i + 1}/${batches.length}`);

        // Generate embeddings for this batch
        const embeddings = [];
        for (const chunk of batch) {
          try {
            const embedding = await generateEmbedding(chunk.content);
            embeddings.push(embedding);
          } catch (error) {
            console.error(`Failed to generate embedding for chunk ${chunk.id}:`, error);
            // Use a zero vector as fallback
            embeddings.push(new Array(config.vectorDimension).fill(0));
          }
        }

        // Prepare data for ChromaDB
        const ids = batch.map(chunk => chunk.id);
        const documents = batch.map(chunk => chunk.content);
        const metadatas = batch.map(chunk => ({
          document: chunk.metadata.document,
          page: chunk.metadata.page.toString(),
          chunkIndex: chunk.metadata.chunkIndex.toString(),
        }));

        // Add to collection
        await collection.add({
          ids,
          embeddings,
          documents,
          metadatas,
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`Successfully added ${chunks.length} documents to vector database`);
    } catch (error) {
      console.error('Error adding documents to vector database:', error);
      throw error;
    }
  }

  // Simple cosine similarity function
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async searchSimilar(query: string, topK: number = config.topKResults): Promise<DocumentSource[]> {
    try {
      const collection = await this.initializeCollection();

      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);

      if (this.isUsingMemory) {
        // Perform similarity search in memory
        const similarities: Array<{chunk: DocumentChunk, similarity: number}> = [];

        for (const chunk of this.memoryData.values()) {
          if (chunk.embedding) {
            const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
            similarities.push({ chunk, similarity });
          } else {
            // Fallback to basic text matching if no embedding
            const textSimilarity = chunk.content.toLowerCase().includes(query.toLowerCase()) ? 0.5 : 0.1;
            similarities.push({ chunk, similarity: textSimilarity });
          }
        }

        // Sort by similarity and take top K
        similarities.sort((a, b) => b.similarity - a.similarity);
        const topResults = similarities.slice(0, topK);

        return topResults.map(result => ({
          document: result.chunk.metadata.document,
          page: result.chunk.metadata.page,
          relevanceScore: result.similarity,
          content: result.chunk.content,
        }));
      }

      // Perform similarity search using ChromaDB
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        include: ['documents', 'metadatas', 'distances'] as any,
      });

      // Transform results to DocumentSource format
      const sources: DocumentSource[] = [];

      if (results.documents && results.documents[0] && results.metadatas && results.metadatas[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          const document = results.documents[0][i];
          const metadata = results.metadatas[0][i] as any;
          const distance = results.distances?.[0]?.[i] ?? 1;

          if (document && metadata) {
            sources.push({
              document: metadata.document,
              page: parseInt(metadata.page) || 1,
              relevanceScore: 1 - distance, // Convert distance to similarity score
              content: document,
            });
          }
        }
      }

      return sources.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('Error searching vector database:', error);
      throw new Error('Failed to search vector database');
    }
  }

  async clearCollection() {
    try {
      if (this.isUsingMemory) {
        this.memoryData.clear();
        console.log('Memory collection cleared successfully');
        return;
      }

      await this.client.deleteCollection({ name: this.collectionName });
      console.log('Collection cleared successfully');
    } catch (error) {
      console.error('Error clearing collection:', error);
      throw error;
    }
  }

  async getCollectionInfo() {
    try {
      if (this.isUsingMemory) {
        return {
          name: this.collectionName + ' (Memory)',
          count: this.memoryData.size,
        };
      }

      const collection = await this.initializeCollection();
      const count = await collection.count();
      return {
        name: this.collectionName,
        count,
      };
    } catch (error) {
      console.error('Error getting collection info:', error);
      throw error;
    }
  }
}