// API route for fetching content from all sources

import { NextRequest, NextResponse } from 'next/server';
import { Domain } from '@/types/idea';
import { aggregateAllSources } from '@/lib/sources/aggregator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, interest } = body as { domain: Domain; interest: string };

    if (!domain || !interest) {
      return NextResponse.json(
        { error: 'Domain and interest are required' },
        { status: 400 }
      );
    }

    const result = await aggregateAllSources(domain, interest);

    if (result.content.length === 0) {
      return NextResponse.json(
        { 
          error: 'No content found from any source',
          details: result.errors 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      content: result.content,
      sources: result.sources,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Fetch API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
