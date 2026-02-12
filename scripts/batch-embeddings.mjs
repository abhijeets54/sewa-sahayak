import fs from 'fs';
import path from 'path';

// Load environment variables
const __dirname = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
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
}

const { PDFProcessor } = await import('../src/lib/pdf-processor.ts');
const { createClient } = await import('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const apiKey = process.env.GOOGLE_API_KEY;

if (!supabaseUrl || !supabaseKey || !apiKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateEmbeddingsBatch(texts) {
  console.log(`📦 Submitting batch request for ${texts.length} embeddings...`);
  
  // Create batch request
  const requests = texts.map((text, index) => ({
    custom_id: `request-${index}`,
    request_type: 'EMBEDDING',
    embedding_request: {
      model: 'models/gemini-embedding-001',
      content: {
        parts: [{ text }],
      },
      output_dimensionality: 768,
    },
  }));

  // Submit batch
  const batchResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/batches?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: 'PDF Embeddings Batch',
        requests,
      }),
    }
  );

  if (!batchResponse.ok) {
    const error = await batchResponse.json();
    throw new Error(`Failed to submit batch: ${error.error?.message}`);
  }

  const batch = await batchResponse.json();
  console.log(`✅ Batch submitted: ${batch.name}`);
  console.log(`   Status: ${batch.state}`);
  console.log(`\n📌 You can check progress at:`);
  console.log(`   https://console.cloud.google.com/vertex-ai/batch-predictions`);
  
  return batch;
}

async function main() {
  console.log('🚀 PDF Batch Embedding Generator\n');

  try {
    // Extract chunks from PDFs
    console.log('📁 Extracting PDF chunks...');
    const pdfProcessor = new PDFProcessor(1500, 300);
    const pdfDirectory = path.join(process.cwd(), 'pdfs');
    const chunks = await pdfProcessor.processPDFDirectory(pdfDirectory);

    console.log(`✅ Extracted ${chunks.length} chunks\n`);

    // Prepare texts only (no embeddings yet)
    const texts = chunks.map(c => c.content);

    // Submit batch
    const batch = await generateEmbeddingsBatch(texts);

    console.log(`\n⏳ Batch processing started!`);
    console.log(`\n📋 Next steps:`);
    console.log(`1. Wait for batch to complete (~30-60 minutes)`);
    console.log(`2. Once complete, run: npm run import-batch-results`);
    console.log(`3. Provide the batch ID when prompted`);
    console.log(`\n💾 Batch ID: ${batch.name}`);

    // Save batch info
    const batchInfo = {
      batchId: batch.name,
      totalChunks: chunks.length,
      submittedAt: new Date().toISOString(),
      chunks: chunks.map(c => ({
        id: c.id,
        content: c.content,
        document: c.metadata.document,
        page: c.metadata.page,
        chunkIndex: c.metadata.chunkIndex,
      })),
    };

    fs.writeFileSync(
      path.join(__dirname, '..', '.batch-info.json'),
      JSON.stringify(batchInfo, null, 2)
    );

    console.log(`\n✅ Batch info saved to .batch-info.json`);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
