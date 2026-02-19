import { NextRequest, NextResponse } from 'next/server';
import { extractIdeas } from '@/lib/ai/gemini';
import { generateIdeasWithGroq } from '@/lib/ai/groq';
import { mergeIdeas } from '@/lib/sources/aggregator';
import type { GenerationParams, RawContent } from '@/types/idea';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, skillLevel, techPreference, timeline, projectType, content } = body;

    if (!domain || !content) {
      return NextResponse.json(
        { error: 'domain and content are required' },
        { status: 400 }
      );
    }

    const params: GenerationParams = {
      domain,
      skillLevel: skillLevel ?? 'intermediate',
      techPreference: techPreference ?? 'no-preference',
      timeline: timeline ?? '2 weeks',
      projectType: projectType ?? 'hackathon',
    };

    // Fire BOTH tracks in parallel
    const [communityResult, aiResult] = await Promise.allSettled([
      extractIdeas(params, content as RawContent[]),
      generateIdeasWithGroq(params),
    ]);

    const communityIdeas =
      communityResult.status === 'fulfilled' ? communityResult.value : [];
    const aiIdeas = aiResult.status === 'fulfilled' ? aiResult.value : [];

    const finalIdeas = mergeIdeas(communityIdeas, aiIdeas);

    if (finalIdeas.length === 0) {
      return NextResponse.json(
        { error: 'Could not generate ideas. Try a different keyword.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ideas: finalIdeas });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
