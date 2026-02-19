import { NextRequest, NextResponse } from 'next/server';
import { IdeaVaultIdea, UserProfile } from '@/types/idea';
import { callGemini, parseGeminiJSON } from '@/lib/ai/gemini';
import { GEMINI_ROADMAP_SYSTEM_PROMPT, getGeminiRoadmapUserPrompt, getGeminiRoadmapUserPromptStrict } from '@/lib/ai/prompts';

interface RoadmapKanban {
  title: string;
  summary: string;
  tech_stack: string[];
  day: Array<{ title: string; items: string[] }>;
  week: Array<{ title: string; items: string[] }>;
  month: Array<{ title: string; items: string[] }>;
}

interface RoadmapRequest {
  idea: IdeaVaultIdea;
  userProfile: UserProfile;
}

export async function POST(request: NextRequest) {
  try {
    const body: RoadmapRequest = await request.json();
    const { idea, userProfile } = body;

    if (!idea || !userProfile) {
      return NextResponse.json(
        { error: 'idea and userProfile are required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const userPrompt = getGeminiRoadmapUserPrompt(idea, userProfile);
    let response = await callGemini(GEMINI_ROADMAP_SYSTEM_PROMPT, userPrompt);
    let roadmap: RoadmapKanban;

    try {
      roadmap = parseGeminiJSON<RoadmapKanban>(response);
    } catch (error) {
      const strictPrompt = getGeminiRoadmapUserPromptStrict(idea, userProfile);
      response = await callGemini(GEMINI_ROADMAP_SYSTEM_PROMPT, strictPrompt);
      try {
        roadmap = parseGeminiJSON<RoadmapKanban>(response);
      } catch (finalError) {
        roadmap = buildFallbackRoadmap(idea, userProfile, 'AI quota reached. Showing a quick fallback roadmap.');
      }
    }

    const normalized: RoadmapKanban = {
      title: roadmap.title || idea.title,
      summary: roadmap.summary || '',
      tech_stack: Array.isArray(roadmap.tech_stack) ? roadmap.tech_stack : idea.rough_tech || [],
      day: Array.isArray(roadmap.day) ? roadmap.day : [],
      week: Array.isArray(roadmap.week) ? roadmap.week : [],
      month: Array.isArray(roadmap.month) ? roadmap.month : [],
    };

    return NextResponse.json({ roadmap: normalized });
  } catch (error) {
    console.error('Gemini roadmap API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate roadmap';
    if (typeof message === 'string' && message.includes('RESOURCE_EXHAUSTED')) {
      const fallback = buildFallbackRoadmap(
        { title: 'Fallback roadmap', rough_tech: [] },
        { skill_level: 'intermediate', time_available: '2 weeks', team_size: 'solo' },
        'AI quota reached. Please try again later.'
      );
      return NextResponse.json({ roadmap: fallback });
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

function buildFallbackRoadmap(
  idea: IdeaVaultIdea,
  userProfile: UserProfile,
  note?: string
): RoadmapKanban {
  const summaryBase = `Starter roadmap for ${idea.title} (${userProfile.time_available}).`;
  const summary = note ? `${summaryBase} ${note}` : summaryBase;

  return {
    title: idea.title,
    summary,
    tech_stack: idea.rough_tech || [],
    day: [
      {
        title: 'Day Plan',
        items: ['Set up repo and environment', 'Sketch core flow and data model'],
      },
    ],
    week: [
      {
        title: 'Week Plan',
        items: ['Build MVP screens and API wiring', 'Test core flows and fix bugs'],
      },
    ],
    month: [
      {
        title: 'Month Plan',
        items: ['Polish UX and add edge cases', 'Deploy and gather feedback'],
      },
    ],
  };
}
