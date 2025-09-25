export const config = {
  googleApiKey: process.env.GOOGLE_API_KEY,
  chromaHost: process.env.CHROMA_HOST || 'localhost',
  chromaPort: parseInt(process.env.CHROMA_PORT || '8000'),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  useSupabase: process.env.USE_SUPABASE === 'true',
  vectorDimension: parseInt(process.env.VECTOR_DIMENSION || '768'),
  topKResults: parseInt(process.env.TOP_K_RESULTS || '8'), // Increased for better coverage
  chunkSize: parseInt(process.env.CHUNK_SIZE || '1500'), // Larger chunks for more context
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '300'), // More overlap
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '-0.1'), // Lower threshold to include more results
} as const;

export const validateConfig = () => {
  const requiredKeys = ['googleApiKey'] as const;
  const missing = requiredKeys.filter(key => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};