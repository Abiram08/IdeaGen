'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { ConversationMessage, IdeaState, BrainstormResponse } from '@/types/idea';
import { Send, Bot, User } from 'lucide-react';

interface BrainstormChatProps {
  ideaState: IdeaState;
  onIdeaUpdate: (newState: IdeaState) => void;
}

export function BrainstormChat({ ideaState, onIdeaUpdate }: BrainstormChatProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingMessage('');

    // Add user message to history
    const newUserMessage: ConversationMessage = {
      role: 'user',
      content: userMessage,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const response = await fetch('/api/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          ideaState,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullResponse = '';

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
              if (parsed.content) {
                fullResponse += parsed.content;
                setStreamingMessage(fullResponse);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      // Parse the final response to extract message and ideaState
      try {
        const parsed: BrainstormResponse = JSON.parse(fullResponse);
        
        // Add assistant message to history
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: parsed.message || fullResponse,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Update idea state if changed
        if (parsed.updatedIdeaState) {
          onIdeaUpdate(parsed.updatedIdeaState);
        }
      } catch {
        // If not valid JSON, just add the raw response as a message
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: fullResponse,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Brainstorm error:', error);
      const errorMessage: ConversationMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-white/5 bg-gradient-to-r from-green-500/10 to-green-600/10">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          Brainstorm Assistant
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Ask questions or request changes to refine your idea
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingMessage && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm">
              Start the conversation to refine your project idea!
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Try: &quot;Change the frontend to Vue&quot; or &quot;Add a feature for notifications&quot;
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white rounded-br-md'
                  : 'glass text-gray-100 rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {/* Streaming message */}
        {streamingMessage && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md glass text-gray-100">
              <p className="text-sm whitespace-pre-wrap">{streamingMessage}</p>
            </div>
          </div>
        )}

        {isLoading && !streamingMessage && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md glass">
              <div className="w-4 h-4 spinner" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 p-4 border-t border-white/5"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="input-dark flex-1"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="glow-button px-4 py-3 rounded-xl text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
