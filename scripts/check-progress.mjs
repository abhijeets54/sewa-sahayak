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

const { createClient } = await import('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProgress() {
  console.log('📊 Checking database progress...\n');
  
  try {
    // Get count of documents
    const { count, error } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log(`✅ Documents in database: ${count}`);
    
    // Calculate progress
    const totalChunks = 2726; // From earlier processing
    const percentage = ((count || 0) / totalChunks * 100).toFixed(1);
    console.log(`📈 Progress: ${percentage}%`);
    
    if (count === totalChunks) {
      console.log('\n🎉 All documents successfully indexed!');
      console.log('\n✨ Your Supabase database is ready to use!');
      console.log('   You can now:');
      console.log('   1. Start the app: npm run dev');
      console.log('   2. Test the chat at: http://localhost:3000');
    } else {
      const remaining = totalChunks - (count || 0);
      console.log(`\n⏳ Remaining: ${remaining} chunks`);
      console.log('   Run: npm run process-pdfs --continue');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

checkProgress();
