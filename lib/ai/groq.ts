// Groq API client — handles AI idea generation (Track B) + brainstorm streaming (Stage 3)

import Groq from 'groq-sdk';
import {
  ROADMAP_SYSTEM_PROMPT,
  buildRoadmapPrompt,
  AI_GENERATE_SYSTEM_PROMPT,
  buildAIGeneratePrompt,
  BRAINSTORM_SYSTEM_PROMPT,
  buildBrainstormPrompt,
} from './prompts';
import type {
  GenerationParams, ExtractedIdea, IdeaState,
  ConversationMessage, UserProfile, ProjectRoadmap,
} from '@/types/idea';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// ── FUNCTION 1: Generate ideas independently (Track B) ──────────

export async function generateIdeasWithGroq(
  params: GenerationParams
): Promise<ExtractedIdea[]> {
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      stream: false,
      temperature: 0.8,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: AI_GENERATE_SYSTEM_PROMPT },
        { role: 'user', content: buildAIGeneratePrompt(params) },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const clean = text.replace(/```json|```/g, '').trim();
    const ideas = JSON.parse(clean);

    return ideas
      .filter((idea: any) => idea.title && idea.problem && idea.concept)
      .map((idea: any) => ({
        ...idea,
        suggested_features: Array.isArray(idea.suggested_features) ? idea.suggested_features : [],
      })) as ExtractedIdea[];
  } catch {
    return [];
  }
}

// ── FUNCTION 2: Stream brainstorm chat ───────────────────────────

export async function streamBrainstorm(
  message: string,
  ideaState: IdeaState,
  conversationHistory: ConversationMessage[]
): Promise<Response> {
  const stream = await client.chat.completions.create({
    model: MODEL,
    stream: true,
    temperature: 0.7,
    max_tokens: 1000,
    messages: [
      { role: 'system', content: BRAINSTORM_SYSTEM_PROMPT },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: buildBrainstormPrompt(ideaState, message) },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// ── FUNCTION 3: Generate roadmap ─────────────────────────────────

export async function generateRoadmap(
  ideaState: IdeaState,
  userProfile: UserProfile
): Promise<ProjectRoadmap> {
  const completion = await client.chat.completions.create({
    model: MODEL,
    stream: false,
    temperature: 0.3,
    max_tokens: 6000,
    messages: [
      { role: 'system', content: ROADMAP_SYSTEM_PROMPT },
      { role: 'user', content: buildRoadmapPrompt(ideaState, userProfile) },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? '';
  const clean = text.replace(/```json|```/g, '').trim();

  let roadmap: any;
  try {
    roadmap = JSON.parse(clean);
  } catch {
    // Find JSON object in response if parsing fails
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON in Groq roadmap response');
    roadmap = JSON.parse(jsonMatch[0]);
  }

  // Validate required fields
  if (!roadmap.title) throw new Error('Roadmap missing title');
  if (!Array.isArray(roadmap.core_features) || roadmap.core_features.length === 0) {
    throw new Error('Roadmap missing core_features');
  }
  if (!Array.isArray(roadmap.roadmap) || roadmap.roadmap.length === 0) {
    throw new Error('Roadmap missing weekly roadmap');
  }

  // Ensure all required fields exist with defaults
  return {
    title: roadmap.title,
    tagline: roadmap.tagline ?? '',
    problem_statement: roadmap.problem_statement ?? '',
    target_user: roadmap.target_user ?? '',
    unique_angle: roadmap.unique_angle ?? '',
    tech_stack: {
      frontend: roadmap.tech_stack?.frontend ?? 'Next.js',
      backend: roadmap.tech_stack?.backend ?? 'Node.js',
      database: roadmap.tech_stack?.database ?? 'Firebase',
      auth: roadmap.tech_stack?.auth ?? 'Firebase Auth',
      hosting: roadmap.tech_stack?.hosting ?? 'Vercel',
      extras: roadmap.tech_stack?.extras ?? [],
    },
    core_features: roadmap.core_features,
    roadmap: roadmap.roadmap,
    technical_risks: roadmap.technical_risks ?? [],
    difficulty_score: roadmap.difficulty_score ?? 5,
    estimated_total_hours: roadmap.estimated_total_hours ?? 40,
    similar_products: roadmap.similar_products ?? [],
    first_thing_to_build: roadmap.first_thing_to_build ?? '',
    competitive_analysis: roadmap.competitive_analysis ? {
      competitors: Array.isArray(roadmap.competitive_analysis.competitors)
        ? roadmap.competitive_analysis.competitors.map((c: any) => ({
            name: c.name ?? '',
            description: c.description ?? '',
            strengths: Array.isArray(c.strengths) ? c.strengths : [],
            weaknesses: Array.isArray(c.weaknesses) ? c.weaknesses : [],
            how_we_differ: c.how_we_differ ?? '',
          }))
        : [],
      market_gap: roadmap.competitive_analysis.market_gap ?? '',
      positioning_strategy: roadmap.competitive_analysis.positioning_strategy ?? '',
    } : undefined,
    tech_recommendations: Array.isArray(roadmap.tech_recommendations)
      ? roadmap.tech_recommendations.map((r: any) => ({
          category: r.category ?? '',
          recommended: r.recommended ?? '',
          pros: Array.isArray(r.pros) ? r.pros : [],
          cons: Array.isArray(r.cons) ? r.cons : [],
          alternatives: Array.isArray(r.alternatives)
            ? r.alternatives.map((a: any) => ({ name: a.name ?? '', reason: a.reason ?? '' }))
            : [],
        }))
      : undefined,
  } as ProjectRoadmap;
}
