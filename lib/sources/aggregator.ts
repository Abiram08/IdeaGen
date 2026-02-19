// Aggregator — fires all 4 source fetchers in parallel

import { RawContent, ExtractedIdea, TechStack } from '@/types/idea';
import { fetchFromHN } from './hn';
import { fetchFromDevTo } from './devto';
import { fetchFromDevpost } from './devpost';

export async function fetchAllSources(
  domain: string,
  interest: string
): Promise<{ content: RawContent[]; sources: string[]; errors: string[] }> {
  const errors: string[] = [];
  const activeSources: string[] = [];

  const results = await Promise.allSettled([
    fetchFromHN(interest),
    fetchFromDevTo(domain),
    fetchFromDevpost(interest),
  ]);

  const sourceNames = ['hackernews', 'devto', 'devpost'];
  const allContent: RawContent[] = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      activeSources.push(sourceNames[i]);
      allContent.push(...result.value);
    } else if (result.status === 'rejected') {
      errors.push(`${sourceNames[i]}: ${result.reason?.message || 'Unknown error'}`);
    }
  });

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allContent.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  // Shuffle so no single source dominates
  const shuffled = unique.sort(() => Math.random() - 0.5);

  // Cap at 20
  const content = shuffled.slice(0, 20);

  return { content, sources: activeSources, errors };
}

export function mergeIdeas(
  communityIdeas: ExtractedIdea[],
  aiIdeas: ExtractedIdea[]
): ExtractedIdea[] {
  const combined = [...communityIdeas, ...aiIdeas];

  // Deduplicate by problem similarity (simple title check)
  const seen = new Set<string>();
  const deduped = combined.filter((idea) => {
    const key = idea.title.toLowerCase().slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Ensure at least 1 from each origin if both contributed
  const community = deduped.filter((i) => i.origin === 'community');
  const ai = deduped.filter((i) => i.origin === 'ai-generated');

  const result: ExtractedIdea[] = [];
  if (community.length > 0) result.push(community[0]);
  if (ai.length > 0) result.push(ai[0]);

  // Fill remaining slots up to 3
  const remaining = deduped.filter((i) => !result.includes(i));
  while (result.length < 3 && remaining.length > 0) {
    result.push(remaining.shift()!);
  }

  return result.slice(0, 3);
}

export function inferTechStack(roughTech: string[]): TechStack {
  const lower = roughTech.map((t) => t.toLowerCase());
  return {
    frontend:
      lower.find((t) =>
        ['react', 'next', 'vue', 'svelte', 'angular'].some((f) => t.includes(f))
      ) ?? 'Next.js',
    backend:
      lower.find((t) =>
        ['node', 'fastapi', 'express', 'django', 'flask'].some((b) => t.includes(b))
      ) ?? 'Node.js',
    database:
      lower.find((t) =>
        ['postgres', 'firebase', 'supabase', 'mongo', 'sqlite'].some((d) => t.includes(d))
      ) ?? 'Firebase',
    extra: roughTech.slice(0, 3),
  };
}
