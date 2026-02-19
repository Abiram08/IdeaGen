// Hacker News source fetcher using Algolia API

import { RawContent } from '@/types/idea';

interface HNHit {
  title: string;
  story_text?: string;
  url?: string;
  objectID: string;
}

export async function fetchFromHN(interest: string): Promise<RawContent[]> {
  try {
    const url = new URL('https://hn.algolia.com/api/v1/search');
    url.searchParams.set('query', interest);
    url.searchParams.set('tags', '(ask_hn,show_hn)');
    url.searchParams.set('hitsPerPage', '10');

    const response = await fetch(url.toString());
    if (!response.ok) return [];

    const data: { hits: HNHit[] } = await response.json();

    return data.hits
      .filter((hit) => hit.story_text && hit.story_text.length > 30)
      .map((hit) => ({
        title: hit.title,
        text: hit.story_text || '',
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        source: 'hackernews' as const,
      }));
  } catch (error) {
    console.error('Error fetching from HN:', error);
    return [];
  }
}
