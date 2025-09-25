import { NextRequest, NextResponse } from 'next/server';
import { VectorDatabase } from '@/lib/vector-db';
import { generateEmbedding } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const vectorDB = new VectorDatabase();

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
    const vectorDB = new VectorDatabase();
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