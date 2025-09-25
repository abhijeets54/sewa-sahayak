import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and processing page
  if (
    pathname.startsWith('/api/') ||
    pathname === '/processing' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  try {
    // Check if documents are processed by calling debug API
    const baseUrl = request.nextUrl.origin;
    const debugResponse = await fetch(`${baseUrl}/api/debug`, {
      method: 'GET',
      cache: 'no-store'
    });

    if (debugResponse.ok) {
      const data = await debugResponse.json();
      const documentCount = data.collectionInfo?.count || 0;

      // If no documents are processed, redirect to processing page
      if (documentCount === 0) {
        const url = request.nextUrl.clone();
        url.pathname = '/processing';
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // If debug API fails, let user through (fail gracefully)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - processing (processing page itself)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|processing).*)',
  ],
};