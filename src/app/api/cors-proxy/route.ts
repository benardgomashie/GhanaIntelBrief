'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const feedUrl = searchParams.get('url');

  if (!feedUrl) {
    return new NextResponse('Missing feed URL', { status: 400 });
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Ghana-IntelBrief-Curation-Bot/1.0',
        'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }

    const body = await response.text();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/xml',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CORS Proxy] Error fetching ${feedUrl}:`, errorMessage);
    return new NextResponse(`Error fetching feed: ${errorMessage}`, { status: 500 });
  }
}
