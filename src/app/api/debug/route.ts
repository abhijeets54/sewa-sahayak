import { NextRequest, NextResponse } from 'next/server';
import { VectorDatabase } from '@/lib/vector-db';
import { SupabaseVectorDatabase } from '@/lib/supabase-vector-db';
import { generateEmbedding } from '@/lib/gemini';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const vectorDB = config.useSupabase ? new SupabaseVectorDatabase() : new VectorDatabase();

    // Get more sources for analysis
    const sources = await vectorDB.searchSimilar(query, 10);

    // Also get collection info
    const collectionInfo = await vectorDB.getCollectionInfo();

    return NextResponse.json({
      query,
      collectionInfo,
      sourcesFound: sources.length,
      sources: sources.map((source, index) => ({
        rank: index + 1,
        document: source.document,
        page: source.page,
        relevanceScore: source.relevanceScore,
        contentPreview: source.content.substring(0, 200) + '...',
        contentLength: source.content.length
      }))
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const vectorDB = config.useSupabase ? new SupabaseVectorDatabase() : new VectorDatabase();
    const collectionInfo = await vectorDB.getCollectionInfo();

    return NextResponse.json({
      status: 'Debug API ready',
      collectionInfo,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}