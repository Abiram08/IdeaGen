import { NextRequest, NextResponse } from 'next/server';
import { generateRoadmap } from '@/lib/ai/groq';

export async function POST(request: NextRequest) {
  try {
    const { finalIdea, userProfile } = await request.json();

    if (!finalIdea || !userProfile) {
      return NextResponse.json(
        { error: 'finalIdea and userProfile are required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const roadmap = await generateRoadmap(finalIdea, userProfile);

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error('Roadmap route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}
