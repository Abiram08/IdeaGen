// Dev.to source fetcher

import { RawContent, Domain, DOMAIN_TO_TAG } from '@/types/idea';

interface DevToArticle {
  title: string;
  description: string;
  url: string;
}

export async function fetchDevTo(domain: Domain): Promise<RawContent[]> {
  try {
    const tag = DOMAIN_TO_TAG[domain] || 'programming';
    
    const url = new URL('https://dev.to/api/articles');
    url.searchParams.set('tag', tag);
    url.searchParams.set('top', '10');
    url.searchParams.set('per_page', '10');

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // DEVTO_API_KEY is optional for reads
    if (process.env.DEVTO_API_KEY) {
      headers['api-key'] = process.env.DEVTO_API_KEY;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      console.error('Dev.to API error:', response.status);
      return [];
    }

    const articles: DevToArticle[] = await response.json();

    return articles
      .filter((article) => article.title)
      .map((article) => ({
        title: article.title,
        text: article.description || '',
        url: article.url,
        source: 'devto' as const,
      }));
  } catch (error) {
    console.error('Error fetching from Dev.to:', error);
    return [];
  }
}
