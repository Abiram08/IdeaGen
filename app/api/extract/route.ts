// API route for extracting ideas using Claude

import { NextRequest, NextResponse } from 'next/server';
import { RawContent, ExtractedIdea } from '@/types/idea';
import { callClaude, parseClaudeJSON } from '@/lib/ai/claude';
import { EXTRACT_SYSTEM_PROMPT, getExtractUserPrompt } from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, content } = body as { domain: string; content: RawContent[] };

    if (!domain || !content || content.length === 0) {
      return NextResponse.json(
        { error: 'Domain and content are required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const userPrompt = getExtractUserPrompt(domain, content);
    const response = await callClaude(EXTRACT_SYSTEM_PROMPT, userPrompt);
    
    const ideas = parseClaudeJSON<ExtractedIdea[]>(response);

    // Validate the response structure
    if (!Array.isArray(ideas) || ideas.length === 0) {
      throw new Error('Invalid response structure from Claude');
    }

    // Ensure we have exactly 3 ideas
    const validatedIdeas = ideas.slice(0, 3).map((idea) => ({
      title: idea.title || 'Untitled Idea',
      problem: idea.problem || 'No problem defined',
      concept: idea.concept || 'No concept defined',
      source_platform: idea.source_platform || 'hackernews',
      source_url: idea.source_url || '#',
      rough_tech: Array.isArray(idea.rough_tech) ? idea.rough_tech : [],
      why_interesting: idea.why_interesting || 'Interesting project idea',
    }));

    return NextResponse.json({ ideas: validatedIdeas });
  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract ideas' },
      { status: 500 }
    );
  }
}
