'use client';

import type React from 'react';

import { useState } from 'react';
import { Brain, Send, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import Sidebar from '@/components/Sidebar';

export default function RAGPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: data.text,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: 'Desculpe, ocorreu um erro ao processar sua pergunta.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="border-b p-6">
          <h1 className="text-3xl font-bold tracking-tight">
            RAG - Retrieval-Augmented Generation
          </h1>
          <p className="text-muted-foreground mt-2">
            Faça perguntas e obtenha respostas baseadas em documentos
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Brain className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Comece uma conversa</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Faça perguntas sobre seus documentos e receba respostas contextualizadas usando IA
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    className={`p-4 max-w-[80%] ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </Card>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="p-4 bg-card">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm text-muted-foreground">Processando sua pergunta...</p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Faça uma pergunta sobre seus documentos..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" size="lg" disabled={isLoading || !query.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
