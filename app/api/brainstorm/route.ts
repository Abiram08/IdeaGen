import { streamBrainstorm } from '@/lib/ai/groq';

export async function POST(request: Request) {
  try {
    const { message, ideaState, conversationHistory } = await request.json();

    if (!message || !ideaState) {
      return new Response(JSON.stringify({ error: 'Message and ideaState are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const groqResponse = await streamBrainstorm(message, ideaState, conversationHistory || []);

    if (!groqResponse.body) {
      throw new Error('No response body from Groq');
    }

    return new Response(groqResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Brainstorm route error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Brainstorm failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
