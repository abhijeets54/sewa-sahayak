#!/usr/bin/env node

/**
 * Supabase Migration Helper Script
 * Helps migrate from old Supabase project to a new one
 * 
 * Usage: node-supabase.js [command]
 * Commands:
 *   validate    - Validate environment variables
 *   setup       - Setup instructions and SQL templates
 *   test        - Test Supabase connection
 *   reprocess   - Reprocess PDFs after migration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  code: (msg) => console.log(`  ${colors.dim}${msg}${colors.reset}`),
};

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  let env = {};
  
  // Load .env.example first
  if (fs.existsSync(envExamplePath)) {
    const content = fs.readFileSync(envExamplePath, 'utf8');
    env = parseEnvFile(content);
  }
  
  // Override with .env.local if it exists
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const localEnv = parseEnvFile(content);
    env = { ...env, ...localEnv };
  }
  
  // Load from process.env as well
  env = { ...env, ...process.env };
  
  return env;
}

function parseEnvFile(content) {
  const env = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
  
  return env;
}

// Validate environment variables
function validateConfig() {
  const env = loadEnv();
  
  log.section('Validating Supabase Configuration');
  
  const required = [
    { key: 'SUPABASE_URL', name: 'Supabase URL' },
    { key: 'SUPABASE_ANON_KEY', name: 'Supabase Anon Key' },
    { key: 'GOOGLE_API_KEY', name: 'Google API Key' },
  ];
  
  let allValid = true;
  
  for (const { key, name } of required) {
    if (env[key]) {
      const value = env[key];
      const displayed = value.length > 20 ? value.substring(0, 20) + '...' : value;
      log.success(`${name}: ${displayed}`);
    } else {
      log.error(`${name}: NOT SET`);
      allValid = false;
    }
  }
  
  const useSupabase = env.USE_SUPABASE === 'true';
  log.info(`Using Supabase: ${useSupabase ? 'YES' : 'NO (using ChromaDB)'}`);
  
  if (!allValid) {
    log.section('Missing Configuration');
    log.warn('Please add the missing environment variables to .env.local');
    log.code('SUPABASE_URL=your-url');
    log.code('SUPABASE_ANON_KEY=your-key');
    log.code('GOOGLE_API_KEY=your-key');
    return false;
  }
  
  log.success('All required variables are configured!');
  return true;
}

// Show setup instructions
function showSetupInstructions() {
  log.section('Supabase Project Migration Steps');
  
  console.log(`
${colors.bright}Step 1: Create New Supabase Project${colors.reset}
  1. Visit https://supabase.com
  2. Click "New Project"
  3. Fill in project details and create
  4. Wait for initialization
  
${colors.bright}Step 2: Get Your Credentials${colors.reset}
  1. Go to Settings → API
  2. Copy the Project URL (SUPABASE_URL)
  3. Copy the anon public key (SUPABASE_ANON_KEY)
  
${colors.bright}Step 3: Update .env.local${colors.reset}
  Create or update .env.local with:
`);
  
  log.code('SUPABASE_URL=your-project-url');
  log.code('SUPABASE_ANON_KEY=your-anon-key');
  log.code('USE_SUPABASE=true');
  log.code('GOOGLE_API_KEY=your-google-api-key');
  
  console.log(`
${colors.bright}Step 4: Enable pgvector Extension${colors.reset}
  1. In Supabase dashboard, go to Database → Extensions
  2. Search for "vector"
  3. Click to enable pgvector
  
${colors.bright}Step 5: Create Database Table${colors.reset}
  Run this SQL in SQL Editor:
`);
  
  showTableSQL();
  
  console.log(`
${colors.bright}Step 6: Create Search Function${colors.reset}
  Run this SQL in SQL Editor:
`);
  
  showSearchFunctionSQL();
  
  console.log(`
${colors.bright}Step 7: Reprocess PDFs${colors.reset}
  Run: npm run process-pdfs
  
${colors.bright}Step 8: Test Connection${colors.reset}
  Run: node scripts/migrate-supabase.js test
  
${colors.bright}Step 9: Start Application${colors.reset}
  Run: npm run dev
`);
}

// Show table SQL
function showTableSQL() {
  const sql = `
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(768),
  document_name TEXT,
  page_number INTEGER,
  chunk_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);`;
  
  console.log(colors.dim + sql + colors.reset);
}

// Show search function SQL
function showSearchFunctionSQL() {
  const sqlFile = path.join(__dirname, '..', 'supabase-search-function.sql');
  if (fs.existsSync(sqlFile)) {
    const content = fs.readFileSync(sqlFile, 'utf8');
    console.log(colors.dim + content + colors.reset);
  } else {
    log.warn('supabase-search-function.sql not found');
  }
}

// Test Supabase connection
async function testConnection() {
  log.section('Testing Supabase Connection');
  
  const env = loadEnv();
  
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    log.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    log.info('Run: node scripts/migrate-supabase.js validate');
    return false;
  }
  
  try {
    log.info('Attempting to connect to Supabase...');
    
    // Try importing Supabase client
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    // Try a simple query
    log.info('Testing table access...');
    const { data, error } = await supabase
      .from('documents')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      log.error(`Connection failed: ${error.message}`);
      return false;
    }
    
    log.success('Connection successful!');
    log.info(`Documents in database: ${data?.length || 0}`);
    return true;
  } catch (err) {
    log.error(`Error: ${err.message}`);
    return false;
  }
}

// Interactive setup wizard
async function interactiveSetup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const question = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  log.section('Supabase Migration Setup Wizard');
  
  try {
    log.info('This wizard will help you migrate to a new Supabase project\n');
    
    const supabaseUrl = await question(`${colors.cyan}Enter your new Supabase URL: ${colors.reset}`);
    const supabaseKey = await question(`${colors.cyan}Enter your new Supabase Anon Key: ${colors.reset}`);
    const googleApiKey = await question(`${colors.cyan}Enter your Google API Key (or press Enter to skip): ${colors.reset}`);
    
    // Read existing .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    let existingContent = '';
    if (fs.existsSync(envPath)) {
      existingContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Parse existing env
    const existingEnv = parseEnvFile(existingContent);
    
    // Create new env
    existingEnv.SUPABASE_URL = supabaseUrl;
    existingEnv.SUPABASE_ANON_KEY = supabaseKey;
    existingEnv.USE_SUPABASE = 'true';
    
    if (googleApiKey) {
      existingEnv.GOOGLE_API_KEY = googleApiKey;
    }
    
    // Write back
    const newContent = Object.entries(existingEnv)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync(envPath, newContent + '\n');
    
    log.success('✓ .env.local updated successfully!');
    log.info('Next steps:');
    log.code('1. Enable pgvector extension in Supabase');
    log.code('2. Run SQL: node scripts/migrate-supabase.js setup');
    log.code('3. Test connection: node scripts/migrate-supabase.js test');
    
    rl.close();
  } catch (err) {
    log.error(`Setup failed: ${err.message}`);
    rl.close();
  }
}

// Main command handler
async function main() {
  const command = process.argv[2] || 'help';
  
  switch (command) {
    case 'validate':
      validateConfig();
      break;
    case 'setup':
      showSetupInstructions();
      break;
    case 'test':
      await testConnection();
      break;
    case 'wizard':
      await interactiveSetup();
      break;
    case 'help':
    default:
      console.log(`
${colors.bright}Supabase Migration Helper${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node scripts/migrate-supabase.js [command]

${colors.cyan}Commands:${colors.reset}
  validate   - Validate current environment variables
  setup      - Show setup instructions and SQL templates
  test       - Test connection to Supabase
  wizard     - Interactive setup wizard for .env.local
  help       - Show this help message

${colors.cyan}Example:${colors.reset}
  node scripts/migrate-supabase.js validate
  node scripts/migrate-supabase.js wizard
      `);
  }
}

main().catch(console.error);
