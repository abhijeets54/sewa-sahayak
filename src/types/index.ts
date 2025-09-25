export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: DocumentSource[];
}

export interface DocumentSource {
  document: string;
  page?: number;
  relevanceScore: number;
  content: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    document: string;
    page: number;
    chunkIndex: number;
  };
  embedding?: number[];
}

export interface ProcessingResult {
  success: boolean;
  message: string;
  documentsProcessed?: number;
  chunksCreated?: number;
  error?: string;
}

export interface QueryResponse {
  answer: string;
  sources: DocumentSource[];
  timestamp: Date;
}