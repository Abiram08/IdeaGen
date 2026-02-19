// Dev.to source fetcher

import { RawContent, DOMAIN_TO_TAG, Domain } from '@/types/idea';

const TAG_MAP: Record<string, string> = {
  'ai-ml':         'machinelearning',
  'saas':          'saas',
  'fintech':       'fintech',
  'healthtech':    'healthtech',
  'edtech':        'edtech',
  'gaming':        'gamedev',
  'social-impact': 'opensource',
  'ecommerce':     'ecommerce',
  'iot':           'iot',
  'devtools':      'devtools',
};

interface DevToArticle {
  title: string;
  description: string;
  url: string;
}

export async function fetchFromDevTo(domain: string): Promise<RawContent[]> {
  try {
    const tag = TAG_MAP[domain] || DOMAIN_TO_TAG[domain as Domain] || 'programming';
    const url = new URL('https://dev.to/api/articles');
    url.searchParams.set('tag', tag);
    url.searchParams.set('top', '10');
    url.searchParams.set('per_page', '10');

    const headers: HeadersInit = { Accept: 'application/json' };
    if (process.env.DEVTO_API_KEY) {
      headers['api-key'] = process.env.DEVTO_API_KEY;
    }

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) return [];

    const articles: DevToArticle[] = await response.json();

    return articles
      .filter((a) => a.description && a.description.length > 20)
      .map((a) => ({
        title: a.title,
        text: a.description,
        url: a.url,
        source: 'devto' as const,
      }));
  } catch (error) {
    console.error('Error fetching from Dev.to:', error);
    return [];
  }
}
