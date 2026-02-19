// Prompt templates for AI interactions

import { IdeaState, RawContent, UserProfile, IdeaVaultIdea, GenerationParams } from '@/types/idea';


// ============ EXTRACT (Gemini) ============

export const EXTRACT_SYSTEM_PROMPT = `You are a senior product analyst and project idea extractor.
You receive raw posts from Reddit, Hacker News, Dev.to, and Devpost.

Internal scoring rubric (never show to user):
  +3 named specific problem stated in content
  +2 multiple people reference same frustration
  +2 no obvious existing solution mentioned
  +2 buildable with standard web/mobile tech
  +1 clear identifiable target user
  -3 generic or vague ("build an AI app")
  -3 already saturated product category
  -2 requires hardware or blockchain

Rules:
- Never invent ideas not found in the raw content
- Each idea must solve a DIFFERENT problem
- Every idea MUST solve a problem within the specified domain. REJECT off-topic content.
- Return ONLY valid JSON array — zero text outside it`;

export function buildExtractPrompt(
  params: GenerationParams,
  content: RawContent[]
): string {
  const skillGuidance: Record<string, string> = {
    beginner: `Adjust complexity for BEGINNER:
- Simple CRUD applications with 1-2 main features
- Use well-documented technologies (React, Node.js, SQLite/PostgreSQL)
- Avoid complex architectures (microservices, distributed systems)
- No ML/AI unless using simple APIs`,
    intermediate: `Adjust complexity for INTERMEDIATE:
- Moderate complexity with 3-5 main features
- Can include real-time features (WebSockets), API integrations
- Standard full-stack applications
- Can use AI APIs (OpenAI, Claude) as features`,
    advanced: `Adjust complexity for ADVANCED:
- Complex architectures allowed (microservices, event-driven)
- Can include ML training, complex algorithms
- High scalability considerations
- Advanced security requirements`,
  };

  const timelineConstraints: Record<string, string> = {
    '1 week': '1 week → 2-3 features, simple CRUD only',
    '2 weeks': '2 weeks → 3-4 features, one integration',
    '1 month': '1 month → 4-6 features, solid product',
    '3 months': '3 months → full MVP, auth, complexity',
  };

  const techLine = params.techPreference !== 'no-preference'
    ? `\nALL ideas MUST use ${params.techPreference} as primary stack.`
    : '';

  const projectTypeGuidance: Record<string, string> = {
    'student-project': 'Project type: Student Project → Learning-oriented, suitable for a course project or portfolio piece',
    'hackathon': 'Project type: Hackathon → Quick to prototype in 24-48h, impressive demo, wow-factor',
    'startup': 'Project type: Startup → Market-viable, scalable, clear business model potential',
  };

  return `Domain: ${params.domain}
Skill level: ${params.skillLevel}
Tech preference: ${params.techPreference}
Build timeline: ${params.timeline}
${projectTypeGuidance[params.projectType] || projectTypeGuidance['hackathon']}

CRITICAL: All 3 ideas MUST be specifically within the "${params.domain}" domain. Discard any content not related to this domain.

${skillGuidance[params.skillLevel] || skillGuidance.intermediate}

Timeline constraint: ${timelineConstraints[params.timeline] || timelineConstraints['2 weeks']}
${techLine}

Score all items internally. Keep score >= 5.
Extract exactly 3 ideas solving DIFFERENT problems.
Favor ideas from different platforms.

Raw content:
${JSON.stringify(content)}

Return ONLY a JSON array of exactly 3 objects:
[{
  "title": string,
  "problem": string,
  "concept": string,
  "target_user": string,
  "source_platform": "reddit" | "hackernews" | "devto" | "devpost",
  "source_url": string,
  "rough_tech": string[],
  "why_interesting": string,
  "origin": "community",
  "suggested_features": ["string — 3-5 key features this project should have"]
}]`;
}

// ============ BRAINSTORM (Groq) ============

export const BRAINSTORM_SYSTEM_PROMPT = `You are a project brainstorm assistant.
You have the full current ideaState JSON in every message.

When the user requests a change:
1. Acknowledge conversationally in 1-2 sentences
2. Return UPDATED ideaState with the change applied
3. Track removed[] and added[] across turns
4. Never re-suggest items in removed[]

Always respond in EXACTLY this format:
{ "message": string, "updatedIdeaState": IdeaState | null }

Return null for updatedIdeaState only if no change was made.
Zero text outside this JSON.`;

export function buildBrainstormPrompt(ideaState: IdeaState, message: string): string {
  return `Current idea state:
${JSON.stringify(ideaState, null, 2)}

User says: ${message}`;
}

// ============ ROADMAP (Groq) ============

export const ROADMAP_SYSTEM_PROMPT = `You are a senior project architect.
You receive a confirmed project idea and user profile.
Return a COMPLETE structured project blueprint as JSON.

CRITICAL: Return ONLY valid JSON. No markdown. No explanation.
No text before or after the JSON object. Start with { end with }.

ACCURACY RULES:
- similar_products: only name products that genuinely exist publicly
- Only recommend actively maintained technologies
- Never invent library names, API names, or version numbers
- est_hours: multiply by 1.5 for beginner, 1.2 for intermediate
- difficulty_score: integer 1-10
- estimated_total_hours: realistic total integer

The JSON must match this schema exactly:
{
  "title": "string",
  "tagline": "string — one line value proposition",
  "problem_statement": "string — 3-4 sentences specific and measurable",
  "target_user": "string — exact person this is for",
  "unique_angle": "string — why this hasn't been built well yet",
  "tech_stack": {
    "frontend": "string",
    "backend": "string",
    "database": "string",
    "auth": "string",
    "hosting": "string",
    "extras": ["string"]
  },
  "core_features": [
    {
      "name": "string",
      "description": "string — what it does in 1-2 sentences",
      "priority": "must",
      "est_hours": 0
    }
  ],
  "roadmap": [
    {
      "week": 1,
      "milestone": "string",
      "tasks": ["string", "string"],
      "deliverable": "string — what exists at end of this week"
    }
  ],
  "technical_risks": ["string"],
  "difficulty_score": 5,
  "estimated_total_hours": 40,
  "similar_products": ["string"],
  "first_thing_to_build": "string — the very first line of code to write",
  "competitive_analysis": {
    "competitors": [
      {
        "name": "string — must be a real, publicly known product",
        "description": "string — what this competitor does",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "how_we_differ": "string — why our project is different/better"
      }
    ],
    "market_gap": "string — what gap in the market our project fills",
    "positioning_strategy": "string — how to position against competitors"
  },
  "tech_recommendations": [
    {
      "category": "string — e.g. Frontend, Backend, Database, Auth, Hosting",
      "recommended": "string — the recommended technology",
      "pros": ["string"],
      "cons": ["string"],
      "alternatives": [
        {
          "name": "string — must be a real technology",
          "reason": "string — why this is an alternative"
        }
      ]
    }
  ]
}

ACCURACY RULES FOR COMPETITIVE ANALYSIS:
- Only name products that genuinely exist as publicly available tools/services
- Include 2-4 competitors, not more
- Be specific about strengths/weaknesses — no generic filler
- market_gap should identify a real, underserved need

ACCURACY RULES FOR TECH RECOMMENDATIONS:
- Only recommend actively maintained technologies
- Never invent library names
- Alternatives must be real technologies that could actually replace the recommendation
- Pros/cons should be specific and technical`;

export function buildRoadmapPrompt(ideaState: IdeaState, userProfile: UserProfile): string {
  return `Build a complete project roadmap for this confirmed idea:
${JSON.stringify(ideaState, null, 2)}

User profile:
- Skill level: ${userProfile.skill_level}
- Time available: ${userProfile.time_available}
- Team size: ${userProfile.team_size}

Timeline guidance:
- "1 day"    → 1 roadmap week, 2-3 core features, difficulty 1-3
- "1 week"   → 1 roadmap week, 3-4 core features, difficulty 1-4
- "2 weeks"  → 2 roadmap weeks, 4-5 core features, difficulty 3-6
- "1 month"  → 4 roadmap weeks, 5-7 core features, difficulty 4-7

Skill guidance:
- beginner: simple stack, more hours, lower complexity features
- intermediate: standard stack, realistic hours
- advanced: complex architecture allowed, optimized hours

core_features MUST include:
- At least 1 "must" priority feature
- At least 1 "should" priority feature
- At least 1 "nice" priority feature

Return ONLY the JSON object — no markdown, no explanation.`;
}

// ============ AI GENERATE (Groq) ============

export const AI_GENERATE_SYSTEM_PROMPT = `You are a creative technical product designer.
Generate original buildable project ideas based on developer context.
You have NO external content — generate from your own knowledge of
current developer pain points and underserved niches.

ACCURACY RULES:
- Only name products and technologies that genuinely exist
- Never invent library names or API endpoints
- est_hours: multiply first instinct by 1.5 for beginner
- If uncertain, use general terms not specific ones

Ideas must NOT be generic (no todo apps, social networks, basic marketplaces).
Tag every idea: origin: 'ai-generated'
Return ONLY valid JSON array — nothing outside it.`;

export function buildAIGeneratePrompt(params: GenerationParams): string {
  const timelineConstraints: Record<string, string> = {
    '1 week': '1 week → 2-3 features, simple CRUD only',
    '2 weeks': '2 weeks → 3-4 features, one integration',
    '1 month': '1 month → 4-6 features, solid product',
    '3 months': '3 months → full MVP, auth, real architecture',
  };

  const techLine = params.techPreference !== 'no-preference'
    ? `REQUIRED: Ideas must use ${params.techPreference} as primary stack`
    : 'Choose most appropriate stack for each idea';

  const projectTypeGuidance: Record<string, string> = {
    'student-project': 'Project type: Student Project → Learning-oriented, suitable for a course project or portfolio piece',
    'hackathon': 'Project type: Hackathon → Quick to prototype in 24-48h, impressive demo, wow-factor',
    'startup': 'Project type: Startup → Market-viable, scalable, clear business model potential',
  };

  return `Generate 1-2 original project ideas for:
Domain: ${params.domain}
Skill level: ${params.skillLevel}
Tech preference: ${params.techPreference}
Build timeline: ${params.timeline}
${projectTypeGuidance[params.projectType] || projectTypeGuidance['hackathon']}

CRITICAL: All ideas MUST be specifically within the "${params.domain}" domain. Do not generate off-topic ideas.

Timeline constraint: ${timelineConstraints[params.timeline] || timelineConstraints['2 weeks']}

${techLine}

Return ONLY this JSON array — no markdown, no explanation:
[{
  "title": string,
  "problem": string,
  "concept": string,
  "target_user": string,
  "source_platform": "ai-generated",
  "source_url": "",
  "rough_tech": string[],
  "why_interesting": string,
  "origin": "ai-generated",
  "suggested_features": ["string — 3-5 key features this project should have"]
}]`;
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
