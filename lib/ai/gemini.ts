// Gemini API client

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

const DEFAULT_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro-002',
  'gemini-1.0-pro',
];

let cachedModels: string[] | null = null;

function normalizeModelName(model: string): string {
  return model.replace(/^models\//, '').trim();
}

async function fetchAvailableModels(apiKey: string): Promise<string[]> {
  if (cachedModels) return cachedModels;

  const endpoints = [
    `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
  ];

  for (const url of endpoints) {
    const response = await fetch(url);
    if (!response.ok) {
      continue;
    }

    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models : [];
    const supported = models
      .filter((model: { supportedGenerationMethods?: string[] }) =>
        Array.isArray(model.supportedGenerationMethods)
          ? model.supportedGenerationMethods.includes('generateContent')
          : false
      )
      .map((model: { name?: string }) => (model.name ? normalizeModelName(model.name) : ''))
      .filter(Boolean);

    if (supported.length > 0) {
      cachedModels = supported;
      return supported;
    }
  }

  cachedModels = [];
  return [];
}

export async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const envModel = process.env.GEMINI_MODEL;
  const availableModels = await fetchAvailableModels(apiKey);
  const modelsToTry = Array.from(
    new Set(
      [envModel, ...availableModels, ...DEFAULT_MODELS]
        .filter(Boolean)
        .map((model) => normalizeModelName(String(model)))
    )
  );
  let lastError = '';

  for (const model of modelsToTry) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      lastError = await response.text();
      if (response.status === 404) {
        continue;
      }
      throw new Error(`Gemini API error (${model}): ${lastError}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error(`No text response from Gemini (${model})`);
    }

    return text;
  }

  const availableList = availableModels.length > 0 ? ` Available: ${availableModels.join(', ')}` : '';
  throw new Error(`Gemini API error (models not found): ${lastError}${availableList}`);
}

export function parseGeminiJSON<T>(response: string): T {
  let cleaned = response.trim();

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    const extracted = extractFirstJSONObject(cleaned);
    if (extracted) {
      return JSON.parse(extracted) as T;
    }
    console.error('Failed to parse Gemini response:', cleaned);
    throw new Error('Invalid JSON response from Gemini');
  }
}

function extractFirstJSONObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  return null;
}
