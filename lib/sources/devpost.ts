// Devpost source fetcher (web scraping)

import * as cheerio from 'cheerio';
import { RawContent } from '@/types/idea';

export async function fetchFromDevpost(interest: string): Promise<RawContent[]> {
  try {
    const url = new URL('https://devpost.com/software/search');
    url.searchParams.set('query', interest);

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: RawContent[] = [];

    // Parse software entries
    $('.software-entry, .gallery-item, [data-software-id]').each((_, el) => {
      if (results.length >= 8) return false;

      const $entry = $(el);
      const name =
        $entry.find('.software-entry-name, .entry-title, h5, h4, .title').first().text().trim() ||
        $entry.find('a').first().text().trim();
      const description =
        $entry.find('.software-entry-tagline, .tagline, .description, p').first().text().trim();
      const href = $entry.find('a').first().attr('href') || $entry.attr('href') || '';
      const projectUrl = href.startsWith('http') ? href : `https://devpost.com${href}`;

      if (name) {
        results.push({
          title: name,
          text: description || `A project related to ${interest}`,
          url: projectUrl,
          source: 'devpost' as const,
        });
      }
    });

    // Fallback: link-based extraction
    if (results.length === 0) {
      $('a[href*="/software/"]').each((_, el) => {
        if (results.length >= 8) return false;
        const $link = $(el);
        const href = $link.attr('href') || '';
        const name = $link.text().trim();
        if (name && name.length > 2 && href.includes('/software/')) {
          const projectUrl = href.startsWith('http') ? href : `https://devpost.com${href}`;
          if (!results.some((r) => r.url === projectUrl)) {
            results.push({
              title: name,
              text: `Hackathon project related to ${interest}`,
              url: projectUrl,
              source: 'devpost' as const,
            });
          }
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Error fetching from Devpost:', error);
    return [];
  }
}
