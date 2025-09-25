'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';
import { generateId } from '@/lib/utils';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { WelcomeScreen } from './welcome-screen';
import { Button } from '@/components/ui/button';
import { PDFViewerModal } from '@/components/ui/pdf-viewer-modal';
import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatInterfaceProps {
  initialMessage?: string | null;
}

export function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfModal, setPdfModal] = useState<{
    isOpen: boolean;
    filename: string;
    page: number;
    title: string;
  }>({
    isOpen: false,
    filename: '',
    page: 1,
    title: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenPDF = (filename: string, page: number, title: string) => {
    setPdfModal({
      isOpen: true,
      filename,
      page,
      title
    });
  };

  const handleClosePDF = () => {
    setPdfModal({
      isOpen: false,
      filename: '',
      page: 1,
      title: ''
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial message from URL params
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      handleSendMessage(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  const handleSendMessage = async (messageContent: string) => {
    if (isLoading) return;

    setError(null);

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      content: messageContent,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Add typing indicator
      const typingMessage: ChatMessage = {
        id: generateId(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, typingMessage]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Remove typing message and add actual response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== typingMessage.id);
        const assistantMessage: ChatMessage = {
          id: generateId(),
          content: data.data.answer,
          role: 'assistant',
          timestamp: new Date(data.data.timestamp),
          sources: data.data.sources,
        };
        return [...withoutTyping, assistantMessage];
      });

    } catch (error) {
      console.error('Chat error:', error);

      // Remove typing message and add error message
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== prev[prev.length - 1].id);
        const errorMessage: ChatMessage = {
          id: generateId(),
          content: error instanceof Error
            ? error.message
            : 'Sorry, I encountered an error. Please try again.',
          role: 'assistant',
          timestamp: new Date(),
        };
        return [...withoutTyping, errorMessage];
      });

      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    handleSendMessage(example);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>
            <div className="w-px h-6 bg-gray-300"></div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Seva Sahayak</h1>
              <p className="text-sm text-gray-500">Punjab Government Services Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <WelcomeScreen onExampleClick={handleExampleClick} />
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isTyping={isLoading && index === messages.length - 1 && message.role === 'assistant' && message.content === ''}
                  onOpenPDF={handleOpenPDF}
                />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask me anything about Punjab Government services..."
          />
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={pdfModal.isOpen}
        onClose={handleClosePDF}
        filename={pdfModal.filename}
        initialPage={pdfModal.page}
        documentTitle={pdfModal.title}
      />
    </div>
  );
}