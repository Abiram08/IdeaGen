'use client';

import { useState, useRef, useEffect } from 'react';
import { IdeaState, ConversationMessage, BrainstormResponse } from '@/types/idea';
import { Send, Rocket, RotateCcw } from 'lucide-react';

interface BrainstormChatProps {
  ideaState: IdeaState;
  onIdeaUpdate: (newState: IdeaState) => void;
  onConfirm: () => void;
  onStartOver: () => void;
}

export function BrainstormChat({ ideaState, onIdeaUpdate, onConfirm, onStartOver }: BrainstormChatProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput('');
    const userMsg: ConversationMessage = { role: 'user', content: text };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);

    // Add placeholder assistant message
    const placeholderIdx = updatedHistory.length;
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          ideaState,
          conversationHistory: updatedHistory.slice(0, -1), // exclude the placeholder
        }),
      });

      if (!response.ok) throw new Error('Brainstorm request failed');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content =
                parsed.content ||
                parsed.choices?.[0]?.delta?.content ||
                '';
              if (content) {
                fullText += content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[placeholderIdx] = { role: 'assistant', content: fullText };
                  return updated;
                });
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }

      // Try to parse the full response as BrainstormResponse JSON
      try {
        const cleaned = fullText.trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed: BrainstormResponse = JSON.parse(jsonMatch[0]);
          // Update the display message
          if (parsed.message) {
            setMessages((prev) => {
              const updated = [...prev];
              updated[placeholderIdx] = { role: 'assistant', content: parsed.message };
              return updated;
            });
          }
          // Update idea state
          if (parsed.updatedIdeaState) {
            onIdeaUpdate(parsed.updatedIdeaState);
          }
        }
      } catch {
        // If JSON parse fails, keep the raw streamed text
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[placeholderIdx] = {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 text-sm">
              Start chatting to refine your idea. Try:
            </p>
            <div className="mt-3 space-y-2">
              {[
                'Change the backend to Python',
                'Add real-time notifications',
                'Simplify it for a weekend project',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="block mx-auto text-xs text-[#07D160]/70 hover:text-[#07D160] transition-colors"
                >
                  &quot;{suggestion}&quot;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-[#07D160]/20 text-white rounded-br-md'
                  : 'bg-white/5 text-zinc-300 rounded-bl-md'
              }`}
            >
              {msg.content || (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07D160] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07D160] animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07D160] animate-pulse" style={{ animationDelay: '0.4s' }} />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input + bottom bar */}
      <div className="border-t border-white/5 p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Refine your idea..."
            disabled={isStreaming}
            className="flex-1 input-dark text-sm"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="px-4 py-2 rounded-xl bg-[#07D160] text-black font-medium text-sm hover:bg-[#07D160]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 glow-button flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm"
          >
            <Rocket className="w-4 h-4" />
            Build The Roadmap
          </button>
          <button
            onClick={onStartOver}
            className="px-4 py-2.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
