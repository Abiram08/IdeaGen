// Prompt templates for AI interactions

import { IdeaState, RawContent, UserProfile, IdeaVaultIdea } from '@/types/idea';

export const EXTRACT_SYSTEM_PROMPT = `You are a project idea extractor. Return ONLY valid JSON. No text outside the JSON.`;

export function getExtractUserPrompt(domain: string, content: RawContent[]): string {
  return `You are given raw content fetched from Reddit, Hacker News, Dev.to, and Devpost. Extract exactly 3 DISTINCT project ideas from this content.

Rules:
- Each idea must solve a DIFFERENT problem — no overlap between the 3
- Ideas must be relevant to domain: ${domain}
- Each must be realistically buildable by a student or small team
- Never invent ideas not found in the source content

Return ONLY a valid JSON array of exactly 3 objects:
[{
  "title": string,
  "problem": string,
  "concept": string,
  "source_platform": "reddit" | "hackernews" | "devto" | "devpost",
  "source_url": string,
  "rough_tech": string[],
  "why_interesting": string
}]

Raw content: ${JSON.stringify(content)}`;
}

export const BRAINSTORM_SYSTEM_PROMPT = `You are a project brainstorm assistant helping a developer shape a project idea. You have access to the current idea state as JSON. When the user requests a change, you MUST:
1. Acknowledge what changed conversationally in 1-2 sentences
2. Return an UPDATED ideaState JSON with the change applied
3. If they ask a question, answer it and suggest whether it changes the idea
Always return in this format exactly:
{ "message": string, "updatedIdeaState": IdeaState | null }
Return null for updatedIdeaState only if no change was made.`;

export function getBrainstormUserPrompt(ideaState: IdeaState, message: string): string {
  return `Current idea state: ${JSON.stringify(ideaState)}

User says: ${message}`;
}

export const ROADMAP_SYSTEM_PROMPT = `You are a senior project architect. You receive a confirmed project idea and return a complete structured blueprint. Always respond with ONLY valid JSON matching the schema exactly. Never add text outside the JSON.`;

export function getRoadmapUserPrompt(finalIdea: IdeaState, userProfile: UserProfile): string {
  return `Build a complete project roadmap for this confirmed idea:
${JSON.stringify(finalIdea)}

User profile:
- Skill level: ${userProfile.skill_level}
- Time available: ${userProfile.time_available}
- Team size: ${userProfile.team_size}

Return ONLY valid JSON matching this schema exactly:
{
  "title": string,
  "tagline": string,
  "problem_statement": string,
  "target_user": string,
  "unique_angle": string,
  "tech_stack": {
    "frontend": string,
    "backend": string,
    "database": string,
    "auth": string,
    "hosting": string,
    "extras": string[]
  },
  "core_features": [{
    "name": string,
    "description": string,
    "priority": "must" | "should" | "nice",
    "est_hours": number
  }],
  "roadmap": [{
    "week": number,
    "milestone": string,
    "tasks": string[],
    "deliverable": string
  }],
  "technical_risks": string[],
  "difficulty_score": number,
  "estimated_total_hours": number,
  "similar_products": string[],
  "first_thing_to_build": string
}`;
}

export const GEMINI_ROADMAP_SYSTEM_PROMPT = `You are a senior project planner. Return ONLY valid JSON. No text outside JSON.`;

export function getGeminiRoadmapUserPrompt(idea: IdeaVaultIdea, userProfile: UserProfile): string {
  return `Create a detailed roadmap from this idea:
${JSON.stringify(idea)}

User profile:
- Skill level: ${userProfile.skill_level}
- Time available: ${userProfile.time_available}
- Team size: ${userProfile.team_size}

Return ONLY valid JSON with this schema:
{
  "title": string,
  "summary": string,
  "tech_stack": string[],
  "day": [{
    "title": string,
    "items": string[]
  }],
  "week": [{
    "title": string,
    "items": string[]
  }],
  "month": [{
    "title": string,
    "items": string[]
  }]
}

Rules:
- Keep each section actionable and realistic.
- 2-3 columns for each timeframe.
- Each column should have 3-5 items.
- Use clear, short task phrases.
- Respect the time available; do not exceed that scale.
`;
}

export function getGeminiRoadmapUserPromptStrict(idea: IdeaVaultIdea, userProfile: UserProfile): string {
  return `STRICT MODE: Return only valid JSON. Keep it short.

Idea:
${JSON.stringify(idea)}

User profile:
- Skill level: ${userProfile.skill_level}
- Time available: ${userProfile.time_available}
- Team size: ${userProfile.team_size}

Return ONLY valid JSON with this schema:
{
  "title": string,
  "summary": string,
  "tech_stack": string[],
  "day": [{
    "title": string,
    "items": string[]
  }],
  "week": [{
    "title": string,
    "items": string[]
  }],
  "month": [{
    "title": string,
    "items": string[]
  }]
}

Rules:
- 1 column per timeframe.
- 2 items per column.
- Summary <= 120 characters.
- Short phrases only.
- Do not include extra commentary.
`;
}
