// API route for generating project roadmap with Claude

import { NextRequest, NextResponse } from 'next/server';
import { IdeaState, UserProfile, ProjectRoadmap } from '@/types/idea';
import { callClaude, parseClaudeJSON } from '@/lib/ai/claude';
import { ROADMAP_SYSTEM_PROMPT, getRoadmapUserPrompt } from '@/lib/ai/prompts';

interface RoadmapRequest {
  finalIdea: IdeaState;
  userProfile: UserProfile;
}

export async function POST(request: NextRequest) {
  try {
    const body: RoadmapRequest = await request.json();
    const { finalIdea, userProfile } = body;

    if (!finalIdea || !userProfile) {
      return NextResponse.json(
        { error: 'finalIdea and userProfile are required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const userPrompt = getRoadmapUserPrompt(finalIdea, userProfile);
    const response = await callClaude(ROADMAP_SYSTEM_PROMPT, userPrompt);
    
    const roadmap = parseClaudeJSON<ProjectRoadmap>(response);

    // Validate and normalize the response
    const validatedRoadmap: ProjectRoadmap = {
      title: roadmap.title || finalIdea.title,
      tagline: roadmap.tagline || '',
      problem_statement: roadmap.problem_statement || finalIdea.problem,
      target_user: roadmap.target_user || 'General users',
      unique_angle: roadmap.unique_angle || '',
      tech_stack: {
        frontend: roadmap.tech_stack?.frontend || finalIdea.tech_stack.frontend,
        backend: roadmap.tech_stack?.backend || finalIdea.tech_stack.backend,
        database: roadmap.tech_stack?.database || finalIdea.tech_stack.database,
        auth: roadmap.tech_stack?.auth || 'JWT',
        hosting: roadmap.tech_stack?.hosting || 'Vercel',
        extras: roadmap.tech_stack?.extras || [],
      },
      core_features: Array.isArray(roadmap.core_features) 
        ? roadmap.core_features.map((f) => ({
            name: f.name || 'Feature',
            description: f.description || '',
            priority: f.priority || 'should',
            est_hours: f.est_hours || 4,
          }))
        : [],
      roadmap: Array.isArray(roadmap.roadmap)
        ? roadmap.roadmap.map((w) => ({
            week: w.week || 1,
            milestone: w.milestone || '',
            tasks: Array.isArray(w.tasks) ? w.tasks : [],
            deliverable: w.deliverable || '',
          }))
        : [],
      technical_risks: Array.isArray(roadmap.technical_risks) 
        ? roadmap.technical_risks 
        : [],
      difficulty_score: roadmap.difficulty_score || 5,
      estimated_total_hours: roadmap.estimated_total_hours || 40,
      similar_products: Array.isArray(roadmap.similar_products) 
        ? roadmap.similar_products 
        : [],
      first_thing_to_build: roadmap.first_thing_to_build || 'Project setup',
    };

    return NextResponse.json({ roadmap: validatedRoadmap });
  } catch (error) {
    console.error('Roadmap API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}
