// Reddit source fetcher with OAuth

import { RawContent } from '@/types/idea';

interface RedditToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    url: string;
    permalink: string;
  };
}

interface RedditSearchResponse {
  data: {
    children: RedditPost[];
  };
}

let cachedToken: { token: string; expires: number } | null = null;

async function getRedditToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Reddit credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ProjectIdeaGen/1.0',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Reddit auth failed: ${response.status}`);
  }

  const data: RedditToken = await response.json();

  // Cache the token with a safety margin
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

export async function fetchReddit(interest: string): Promise<RawContent[]> {
  try {
    const token = await getRedditToken();

    const subreddits = 'SideProject+hackathon+learnprogramming+startups';
    const url = new URL(`https://oauth.reddit.com/r/${subreddits}/search`);
    url.searchParams.set('q', interest);
    url.searchParams.set('sort', 'top');
    url.searchParams.set('limit', '10');
    url.searchParams.set('restrict_sr', 'true');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'ProjectIdeaGen/1.0',
      },
    });

    if (!response.ok) {
      console.error('Reddit API error:', response.status);
      return [];
    }

    const data: RedditSearchResponse = await response.json();

    return data.data.children
      .filter((post) => post.data.title)
      .map((post) => ({
        title: post.data.title,
        text: post.data.selftext || '',
        url: `https://reddit.com${post.data.permalink}`,
        source: 'reddit' as const,
      }));
  } catch (error) {
    console.error('Error fetching from Reddit:', error);
    return [];
  }
}
