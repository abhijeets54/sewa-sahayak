'use client';

import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { Button } from './button';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  initialPage?: number;
  documentTitle?: string;
}

export function PDFViewerModal({
  isOpen,
  onClose,
  filename,
  initialPage = 1,
  documentTitle
}: PDFViewerModalProps) {
  const pdfUrl = `/api/pdf/${filename}`;

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50 rounded-t-lg">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {documentTitle || filename}
            </h3>
            {initialPage > 1 && (
              <p className="text-sm text-gray-600">
                Jump to page {initialPage}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-200 text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            Choose how you'd like to view this document:
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleOpenInNewTab}
              className="w-full justify-start"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-3" />
              Open in New Tab
            </Button>

            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full justify-start text-gray-900 hover:text-gray-700"
              size="lg"
            >
              <Download className="h-4 w-4 mr-3" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg text-center">
          <p className="text-xs text-gray-500">
            The PDF will open in a new browser tab for better viewing
          </p>
        </div>
      </div>
    </div>
  );
}