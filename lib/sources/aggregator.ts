// Aggregator for all content sources

import { Domain, RawContent } from '@/types/idea';
import { fetchHackerNews } from './hn';
import { fetchReddit } from './reddit';
import { fetchDevTo } from './devto';
import { fetchDevpost } from './devpost';

export interface AggregatedResult {
  content: RawContent[];
  sources: {
    hackernews: number;
    reddit: number;
    devto: number;
    devpost: number;
  };
  errors: string[];
}

export async function aggregateAllSources(
  domain: Domain,
  interest: string
): Promise<AggregatedResult> {
  const errors: string[] = [];

  // Fetch all sources in parallel using Promise.allSettled
  const results = await Promise.allSettled([
    fetchHackerNews(interest),
    fetchReddit(interest),
    fetchDevTo(domain),
    fetchDevpost(interest),
  ]);

  const sourceNames = ['hackernews', 'reddit', 'devto', 'devpost'] as const;
  const content: RawContent[] = [];
  const sources = {
    hackernews: 0,
    reddit: 0,
    devto: 0,
    devpost: 0,
  };

  results.forEach((result, index) => {
    const sourceName = sourceNames[index];
    
    if (result.status === 'fulfilled') {
      const items = result.value;
      sources[sourceName] = items.length;
      content.push(...items);
    } else {
      errors.push(`${sourceName}: ${result.reason?.message || 'Unknown error'}`);
    }
  });

  // Shuffle and limit to 20 items
  const shuffled = content.sort(() => Math.random() - 0.5);
  const limited = shuffled.slice(0, 20);

  return {
    content: limited,
    sources,
    errors,
  };
}
