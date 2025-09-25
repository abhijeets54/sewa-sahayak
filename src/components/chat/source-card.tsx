'use client';

import React from 'react';
import { DocumentSource } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ExternalLink } from 'lucide-react';
import { cn, truncateText } from '@/lib/utils';

interface SourceCardProps {
  source: DocumentSource;
  onOpenPDF?: (filename: string, page: number, title: string) => void;
}

export function SourceCard({ source, onOpenPDF }: SourceCardProps) {
  const relevancePercentage = Math.round(source.relevanceScore * 100);

  return (
    <Card className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {source.document}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                {source.page && <span>Page {source.page}</span>}
                <div className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  relevancePercentage >= 80
                    ? 'bg-green-100 text-green-700'
                    : relevancePercentage >= 60
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  {relevancePercentage}%
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2">
              {truncateText(source.content, 150)}
            </p>
          </div>

          <button
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors hover:bg-white rounded"
            onClick={() => {
              if (onOpenPDF) {
                // Extract filename with .pdf extension
                const filename = source.document.endsWith('.pdf')
                  ? source.document
                  : `${source.document}.pdf`;
                onOpenPDF(filename, source.page || 1, source.document);
              }
            }}
            title={`Open ${source.document}${source.page ? ` at page ${source.page}` : ''}`}
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}