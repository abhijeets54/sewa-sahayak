import path from 'path';
import { PDFProcessor } from '../src/lib/pdf-processor.js';
import { VectorDatabase } from '../src/lib/vector-db.js';
import { config } from '../src/lib/config.js';

async function processPDFs() {
  console.log('🚀 Starting PDF processing pipeline...');

  try {
    // Validate configuration
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }

    // Initialize components
    const pdfProcessor = new PDFProcessor(config.chunkSize, config.chunkOverlap);
    const vectorDB = new VectorDatabase();

    console.log('📁 Processing PDFs from directory: ./pdfs');

    // Process PDFs and extract chunks
    const pdfDirectory = path.join(process.cwd(), 'pdfs');
    const chunks = await pdfProcessor.processPDFDirectory(pdfDirectory);

    if (chunks.length === 0) {
      console.log('❌ No content extracted from PDFs');
      return;
    }

    console.log(`✅ Successfully extracted ${chunks.length} chunks from PDFs`);

    // Clear existing collection (optional - remove in production)
    console.log('🧹 Clearing existing vector database collection...');
    try {
      await vectorDB.clearCollection();
    } catch (error) {
      console.log('ℹ️ Collection does not exist or already cleared');
    }

    // Add chunks to vector database
    console.log('💾 Adding documents to vector database...');
    await vectorDB.addDocuments(chunks);

    // Get collection info
    const info = await vectorDB.getCollectionInfo();
    console.log(`✅ Processing complete! Collection '${info.name}' now contains ${info.count} documents`);

    console.log('\n📊 Processing Summary:');
    console.log(`   • Documents processed: ${chunks.length > 0 ? [...new Set(chunks.map(c => c.metadata.document))].length : 0}`);
    console.log(`   • Total chunks created: ${chunks.length}`);
    console.log(`   • Vector database entries: ${info.count}`);
    console.log('\n🎉 PDF processing pipeline completed successfully!');

  } catch (error) {
    console.error('❌ Error in PDF processing pipeline:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   • Make sure GOOGLE_API_KEY is set in .env.local');
    console.error('   • Ensure ChromaDB is running (if using remote instance)');
    console.error('   • Check that PDF files exist in the ./pdfs directory');
    process.exit(1);
  }
}

// Run the pipeline
processPDFs();