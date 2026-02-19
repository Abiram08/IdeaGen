import { NextRequest, NextResponse } from 'next/server';
import { fetchAllSources } from '@/lib/sources/aggregator';
import { DOMAIN_SEARCH_TERMS, Domain } from '@/types/idea';

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    const searchTerm = DOMAIN_SEARCH_TERMS[domain as Domain] || domain;
    const result = await fetchAllSources(domain, searchTerm);

    if (result.content.length === 0) {
      return NextResponse.json(
        { error: 'No content found from any source. Try different keywords.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fetch route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
