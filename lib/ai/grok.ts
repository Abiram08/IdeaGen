// Grok API client for xAI streaming

import { ConversationMessage, IdeaState } from '@/types/idea';
import { BRAINSTORM_SYSTEM_PROMPT, getBrainstormUserPrompt } from './prompts';

export interface GrokStreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

export async function streamGrokResponse(
  ideaState: IdeaState,
  message: string,
  conversationHistory: ConversationMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const messages = [
    { role: 'system', content: BRAINSTORM_SYSTEM_PROMPT },
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: getBrainstormUserPrompt(ideaState, message) },
  ];

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-beta',
      stream: true,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body from Grok API');
  }

  return response.body;
}

export function createSSEStream(grokStream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  let buffer = '';
  
  const transformStream = new TransformStream<Uint8Array, Uint8Array>({
    async transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            continue;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    },
    flush(controller) {
      if (buffer.startsWith('data: ') && buffer.slice(6) !== '[DONE]') {
        try {
          const parsed = JSON.parse(buffer.slice(6));
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        } catch {
          // Ignore final malformed chunk
        }
      }
    }
  });
  
  return grokStream.pipeThrough(transformStream);
}
