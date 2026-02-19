import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import type { ProjectRoadmap } from '@/types/idea';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

const SCAFFOLD_SYSTEM_PROMPT = `You are a senior software engineer who generates project starter code.
Given a project roadmap, generate a working project scaffold with 8-15 files.

RULES:
- Generate REAL, compilable code with correct syntax
- Use real package names and versions that exist on npm/pypi
- Include a proper package.json (or equivalent) with real dependencies
- Include at least: entry point, config file, one component/route, one utility
- Code should be minimal but functional — not just comments
- setup_commands should be the actual commands to install and run
- readme_content should explain the project and how to get started

Return ONLY valid JSON matching this schema:
{
  "files": [
    {
      "path": "string — relative file path like src/index.ts",
      "description": "string — what this file does",
      "content": "string — the actual file content"
    }
  ],
  "setup_commands": ["npm install", "npm run dev"],
  "readme_content": "# Project Name\\n..."
}

No markdown fences. No explanation. Start with { end with }.`;

export async function POST(request: NextRequest) {
  try {
    const { roadmap } = (await request.json()) as { roadmap: ProjectRoadmap };

    if (!roadmap?.title) {
      return NextResponse.json({ error: 'Missing roadmap' }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: MODEL,
      stream: false,
      temperature: 0.3,
      max_tokens: 8000,
      messages: [
        { role: 'system', content: SCAFFOLD_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Generate a project scaffold for:
Title: ${roadmap.title}
Tech Stack: Frontend=${roadmap.tech_stack.frontend}, Backend=${roadmap.tech_stack.backend}, Database=${roadmap.tech_stack.database}, Auth=${roadmap.tech_stack.auth}
Core Features: ${roadmap.core_features.map((f) => f.name).join(', ')}
First thing to build: ${roadmap.first_thing_to_build}

Return ONLY the JSON scaffold.`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const clean = text.replace(/```json|```/g, '').trim();

    let scaffold: any;
    try {
      scaffold = JSON.parse(clean);
    } catch {
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Invalid scaffold response' }, { status: 500 });
      }
      scaffold = JSON.parse(jsonMatch[0]);
    }

    // Validate
    if (!Array.isArray(scaffold.files) || scaffold.files.length === 0) {
      return NextResponse.json({ error: 'Scaffold has no files' }, { status: 500 });
    }

    return NextResponse.json({
      scaffold: {
        files: scaffold.files.map((f: any) => ({
          path: f.path ?? 'unknown',
          description: f.description ?? '',
          content: f.content ?? '',
        })),
        setup_commands: Array.isArray(scaffold.setup_commands) ? scaffold.setup_commands : [],
        readme_content: scaffold.readme_content ?? '',
      },
    });
  } catch (err) {
    console.error('Scaffold generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate scaffold' },
      { status: 500 }
    );
  }
}
