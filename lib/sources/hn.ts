// Hacker News source fetcher using Algolia API

import { RawContent } from '@/types/idea';

interface HNHit {
  title: string;
  story_text?: string;
  url?: string;
  objectID: string;
}

interface HNSearchResponse {
  hits: HNHit[];
}

export async function fetchHackerNews(interest: string): Promise<RawContent[]> {
  try {
    const url = new URL('https://hn.algolia.com/api/v1/search');
    url.searchParams.set('query', interest);
    url.searchParams.set('tags', '(ask_hn,show_hn)');
    url.searchParams.set('hitsPerPage', '10');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error('HN API error:', response.status);
      return [];
    }

    const data: HNSearchResponse = await response.json();

    return data.hits
      .filter((hit) => hit.title && (hit.story_text || hit.url))
      .map((hit) => ({
        title: hit.title,
        text: hit.story_text || '',
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        source: 'hackernews' as const,
      }));
  } catch (error) {
    console.error('Error fetching from Hacker News:', error);
    return [];
  }
}
