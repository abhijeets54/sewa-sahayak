'use client';

import React from 'react';
import { ChatMessage } from '@/types';
import { cn, formatTimestamp } from '@/lib/utils';
import { User, Bot, FileText } from 'lucide-react';
import { SourceCard } from './source-card';

interface MessageBubbleProps {
  message: ChatMessage;
  isTyping?: boolean;
}

export function MessageBubble({ message, isTyping = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex w-full gap-3 message-slide-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] space-y-3',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
          )}
        >
          {isTyping ? (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FileText className="w-3 h-3" />
              <span>Sources:</span>
            </div>
            <div className="grid gap-2">
              {message.sources.map((source, index) => (
                <SourceCard key={index} source={source} />
              ))}
            </div>
          </div>
        )}

        <div
          className={cn(
            'text-xs text-gray-500',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {formatTimestamp(message.timestamp)}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}