# Supabase Project Migration Guide

This guide will help you migrate from your old Supabase project to a new one after losing your database due to inactivity.

## Quick Start

### Option A: Interactive Setup (Recommended)
```bash
npm run migrate:wizard
```
This will guide you through the setup process interactively.

---

### Option B: Manual Steps

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click **"New Project"**
4. Fill in the details:
   - **Project name**: Choose a descriptive name
   - **Database password**: Create a strong password (save it!)
   - **Region**: Select your preferred region
5. Click **"Create new project"**
6. Wait for the project to initialize (2-3 minutes)

## Step 2: Get Your API Credentials

1. In your new Supabase project, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** → Your `SUPABASE_URL`
   - **anon public** key → Your `SUPABASE_ANON_KEY`

## Step 3: Update Your Environment Variables

1. Update or create `.env.local` in your project root:
```bash
SUPABASE_URL=your-new-project-url
SUPABASE_ANON_KEY=your-new-anon-key
USE_SUPABASE=true
GOOGLE_API_KEY=your-existing-google-api-key
```

2. Validate your configuration:
```bash
npm run migrate:validate
```

You should see all variables marked as set.

## Step 4: Enable pgvector Extension

1. In your Supabase dashboard, go to **Database** → **Extensions**
2. Search for **"vector"**
3. Click the extension to enable **pgvector**

## Step 5: Create Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New Query"**
3. Run this SQL to create the documents table:

```sql
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(768),
  document_name TEXT,
  page_number INTEGER,
  chunk_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);
```

## Step 6: Create Search Function

1. Still in **SQL Editor**, create a new query
2. Run the SQL from `supabase-search-function.sql`:
```bash
npm run migrate:setup
```

Copy the SQL output and paste it into Supabase SQL Editor.

Alternatively, open [supabase-search-function.sql](supabase-search-function.sql) in your editor and manually copy the function definition.

## Step 7: Test Connection

Test that everything is working:
```bash
npm run migrate:test
```

You should see:
```
✓ Connection successful!
Documents in database: 0
```

## Step 8: Reprocess PDFs

Now populate your new database with embeddings:
```bash
npm run process-pdfs
```

This will:
- Read all PDFs from the `pdfs/` directory
- Generate embeddings using Google Gemini
- Insert documents into Supabase

Monitor the console for progress. This may take a while depending on the number of PDFs.

## Step 9: Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and test the chat functionality.

---

## Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env.local` has `SUPABASE_URL` and `SUPABASE_ANON_KEY` set correctly
- Run `npm run migrate:validate` to check

### "Connection failed"
- Verify the URL and key are correct (copy from Supabase dashboard again)
- Ensure pgvector extension is enabled
- Ensure the table and function are created

### "Table does not exist"
- Run the SQL in Step 5 to create the table
- Verify it appears in Supabase under **Table Editor**

### "Function does not exist"
- Run the SQL in Step 6 to create the search function
- Verify it appears in Supabase under **Functions**

### PDFs not being indexed
- Check that `GOOGLE_API_KEY` is set correctly
- Ensure PDF files are in the `pdfs/` directory
- Check the console output for specific error messages

---

## Alternative: Continue with ChromaDB

If you prefer to use ChromaDB locally instead of Supabase:

1. Set `USE_SUPABASE=false` in `.env.local`
2. Start ChromaDB:
   - **Windows**: `start-chromadb.bat`
   - **Linux/Mac**: `./start-chromadb.sh`
3. Process PDFs: `npm run process-pdfs`
4. Start app: `npm run dev`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes (if using Supabase) | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes (if using Supabase) | Public anon key from Supabase |
| `USE_SUPABASE` | Yes | Set to `true` for Supabase, `false` for ChromaDB |
| `GOOGLE_API_KEY` | Yes | Google Generative AI API key for embeddings |
| `CHROMA_HOST` | No | ChromaDB host (default: localhost) |
| `CHROMA_PORT` | No | ChromaDB port (default: 8000) |

---

## Additional Helper Commands

```bash
# Validate environment variables
npm run migrate:validate

# Show setup instructions
npm run migrate:setup

# Test Supabase connection
npm run migrate:test

# Interactive setup wizard
npm run migrate:wizard

# Process PDFs
npm run process-pdfs

# Start development server
npm run dev
```

---

## Questions or Issues?

Check the console output for detailed error messages. Most issues can be resolved by:
1. Double-checking your API credentials
2. Ensuring database extensions and tables are created
3. Verifying environment variables are set correctly
