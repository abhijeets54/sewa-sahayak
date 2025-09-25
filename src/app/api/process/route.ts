import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdf-processor';
import { VectorDatabase } from '@/lib/vector-db';
import { validateConfig, config } from '@/lib/config';
import path from 'path';

export async function POST() {
  try {
    // Validate environment configuration
    validateConfig();

    console.log('Starting PDF processing...');

    // Initialize components
    const pdfProcessor = new PDFProcessor(config.chunkSize, config.chunkOverlap);
    const vectorDB = new VectorDatabase();

    // Process PDFs
    const pdfDirectory = path.join(process.cwd(), 'pdfs');
    const chunks = await pdfProcessor.processPDFDirectory(pdfDirectory);

    if (chunks.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No content extracted from PDFs',
        documentsProcessed: 0,
        chunksCreated: 0,
      });
    }

    // Clear existing collection
    try {
      await vectorDB.clearCollection();
    } catch (error) {
      console.log('Collection does not exist or already cleared');
    }

    // Add chunks to vector database (now optimized for Vercel)
    await vectorDB.addDocuments(chunks);

    // Get final collection info
    const info = await vectorDB.getCollectionInfo();

    const uniqueDocuments = Array.from(new Set(chunks.map(c => c.metadata.document)));

    return NextResponse.json({
      success: true,
      message: 'PDF processing completed successfully',
      documentsProcessed: uniqueDocuments.length,
      chunksCreated: chunks.length,
      vectorDatabaseEntries: info.count,
      processedDocuments: uniqueDocuments,
    });

  } catch (error) {
    console.error('PDF processing API error:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to process PDFs',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    validateConfig();
    const vectorDB = new VectorDatabase();
    const info = await vectorDB.getCollectionInfo();

    return NextResponse.json({
      service: 'PDF Processing API',
      status: 'ready',
      vectorDatabase: {
        collectionName: info.name,
        documentCount: info.count,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Processing API health check error:', error);

    return NextResponse.json({
      service: 'PDF Processing API',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}