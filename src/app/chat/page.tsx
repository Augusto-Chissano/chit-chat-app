'use client';

import { CoreMessage } from 'ai';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(current => [...current, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const { messages: newMessages } = await response.json();
      setMessages(current => [...current, ...newMessages]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(current => [
        ...current,
        { role: 'assistant', content: 'Sorry, something went wrong. Please, try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 border-b border-black/[.08] dark:border-white/[.145] p-4 bg-background z-10 backdrop-blur-sm bg-background/80">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Image
            className="dark:invert"
            src="/ChitChat.svg"
            alt="ChitChat Logo"
            width={120}
            height={25}
          />
          <span className="text-xs font-[family-name:var(--font-geist-mono)] text-gray-500">
            AI-powered assistant
          </span>
        </div>
      </header>

      <div
        className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto mt-16 mb-24"
        style={{
          marginTop: '4rem',
          marginBottom: '6rem'
        }}
      >
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p>Your crutch is here</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                    ? 'bg-foreground text-background'
                    : 'bg-black/[.05] dark:bg-white/[.06]'
                  }`}
              >
                {typeof message.content === 'string'
                  ? message.content
                  : message.content
                    .filter(part => part.type === 'text')
                    .map((part, partIndex) => (
                      <div key={partIndex}>{part.text}</div>
                    ))}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-black/[.05] dark:bg-white/[.06] rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-black/[.08] dark:border-white/[.145] p-4 bg-background z-10">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask anything"
            className="flex-1 rounded-full border border-black/[.08] dark:border-white/[.145] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-foreground text-background px-4 py-2 hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}