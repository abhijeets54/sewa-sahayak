import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';
import { validateConfig } from '@/lib/config';

const ragService = new RAGService();

export async function POST(request: NextRequest) {
  try {
    // Validate environment configuration
    validateConfig();

    const { message } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Process the query using RAG service
    const result = await ragService.query(message.trim());

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Return appropriate error messages
    if (error instanceof Error) {
      if (error.message.includes('Missing required environment variables')) {
        return NextResponse.json(
          { error: 'Service configuration error. Please contact support.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    validateConfig();
    const healthCheck = await ragService.healthCheck();

    return NextResponse.json({
      service: 'Seva Sahayak Chat API',
      status: healthCheck.status,
      details: healthCheck.details,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json({
      service: 'Seva Sahayak Chat API',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}