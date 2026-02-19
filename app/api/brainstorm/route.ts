// API route for brainstorming with Grok (streaming)

import { NextRequest } from 'next/server';
import { BrainstormRequest } from '@/types/idea';
import { streamGrokResponse, createSSEStream } from '@/lib/ai/grok';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body: BrainstormRequest = await request.json();
    const { message, ideaState, conversationHistory } = body;

    if (!message || !ideaState) {
      return new Response(
        JSON.stringify({ error: 'Message and ideaState are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.GROK_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Grok API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const grokStream = await streamGrokResponse(
      ideaState,
      message,
      conversationHistory || []
    );

    const sseStream = createSSEStream(grokStream);

    return new Response(sseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Brainstorm API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process brainstorm request' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
