import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables FIRST before importing anything else
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
  console.log('✓ Loaded environment variables from .env.local');
} else {
  console.warn('⚠️ .env.local file not found - environment variables not loaded');
}

// Now import the modules that depend on environment variables
const { PDFProcessor } = await import('../src/lib/pdf-processor.ts');
const { VectorDatabase } = await import('../src/lib/vector-db.ts');
const { SupabaseVectorDatabase } = await import('../src/lib/supabase-vector-db.ts');
const { config } = await import('../src/lib/config.ts');

async function processPDFs() {
  console.log('🚀 Starting PDF processing pipeline...');

  try {
    // Validate configuration
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }

    // Initialize components
    const pdfProcessor = new PDFProcessor(config.chunkSize, config.chunkOverlap);
    const vectorDB = config.useSupabase ? new SupabaseVectorDatabase() : new VectorDatabase();

    console.log('📁 Processing PDFs from directory: ./pdfs');
    console.log(`📊 Using ${config.useSupabase ? 'Supabase' : 'ChromaDB'} as vector database`);

    // Process PDFs and extract chunks
    const pdfDirectory = path.join(process.cwd(), 'pdfs');
    const chunks = await pdfProcessor.processPDFDirectory(pdfDirectory);

    if (chunks.length === 0) {
      console.log('❌ No content extracted from PDFs');
      process.exit(0);
    }

    console.log(`✅ Successfully extracted ${chunks.length} chunks from PDFs`);

    // Add chunks to vector database (works with both Supabase and ChromaDB)
    console.log('💾 Adding documents to vector database...');
    await vectorDB.addDocuments(chunks);

    console.log(`✅ Processing complete! Added ${chunks.length} document chunks`);

    console.log('\n📊 Processing Summary:');
    const uniqueDocs = [...new Set(chunks.map(c => c.metadata.document))].length;
    console.log(`   • Documents processed: ${uniqueDocs}`);
    console.log(`   • Total chunks created: ${chunks.length}`);
    console.log(`   • Vector DB: ${config.useSupabase ? 'Supabase' : 'ChromaDB'}`);

    console.log('\n🎉 PDF processing pipeline completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error processing PDFs:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   • Make sure GOOGLE_API_KEY is set in .env.local');
    console.error('   • If using Supabase: Check SUPABASE_URL and SUPABASE_ANON_KEY are set');
    console.error('   • If using ChromaDB: Ensure ChromaDB service is running');
    console.error('   • Check that PDF files exist in the ./pdfs directory');
    process.exit(1);
  }
}

processPDFs();
