import fs from 'fs';
import path from 'path';

// Load environment variables FIRST
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

// Now import modules
const { generateEmbedding } = await import('../src/lib/gemini.ts');

async function testEmbedding() {
  console.log('Testing Gemini Embedding API...\n');
  
  try {
    const testText = 'Hello, this is a test embedding.';
    console.log(`📝 Input text: "${testText}"`);
    console.log('⏳ Generating embedding...\n');
    
    const embedding = await generateEmbedding(testText);
    
    console.log(`✅ Success!`);
    console.log(`📊 Embedding dimensions: ${embedding.length}`);
    console.log(`📈 First 10 values: [${embedding.slice(0, 10).map(v => v.toFixed(4)).join(', ')}...]`);
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testEmbedding();
