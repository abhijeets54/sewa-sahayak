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

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('❌ GOOGLE_API_KEY not found in environment');
  process.exit(1);
}

async function listModels() {
  console.log('📋 Fetching available models...\n');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Found ${data.models.length} available models:\n`);
    
    data.models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
    });

    // Filter embedding models
    const embeddingModels = data.models.filter(m => 
      m.name.includes('embedding') || m.name.includes('embed')
    );

    if (embeddingModels.length > 0) {
      console.log(`\n✅ Embedding models available:`);
      embeddingModels.forEach(model => {
        console.log(`   - ${model.name}`);
      });
    } else {
      console.log(`\n⚠️  No embedding models found!`);
      console.log(`\n📌 To use embeddings:`);
      console.log(`1. Go to: https://console.cloud.google.com/apis/library`);
      console.log(`2. Search for "Generative Language API"`);
      console.log(`3. Click "Enable"`);
      console.log(`4. Make sure billing is enabled on your project`);
      console.log(`5. Wait a few minutes for changes to take effect`);
      console.log(`6. Then run: npm run list-models`);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    console.error('\n💡 For debugging:');
    console.error('   - Check your API key is correct');
    console.error('   - Ensure billing is enabled in Google Cloud');
    console.error('   - Visit: https://aistudio.google.com/apikey to verify your key');
    process.exit(1);
  }
}

listModels();
