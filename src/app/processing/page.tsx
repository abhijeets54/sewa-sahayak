'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, FileText, Database, CheckCircle } from 'lucide-react';

interface ProcessingStatus {
  isProcessing: boolean;
  documentCount: number;
  totalDocuments: number;
  completed: boolean;
  error?: string;
}

export default function ProcessingPage() {
  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    documentCount: 0,
    totalDocuments: 1840,
    completed: false
  });
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const router = useRouter();

  // Check initial status and start processing if needed
  useEffect(() => {
    const initializeProcessing = async () => {
      try {
        // Check current status
        const debugResponse = await fetch('/api/debug');
        const debugData = await debugResponse.json();
        const currentCount = debugData.collectionInfo?.count || 0;

        if (currentCount === 0) {
          // Start processing
          setStatus(prev => ({ ...prev, isProcessing: true }));

          // Trigger processing
          fetch('/api/process', { method: 'POST' }).catch(console.error);
        } else if (currentCount >= 1840) {
          // Already completed
          setStatus(prev => ({
            ...prev,
            documentCount: currentCount,
            completed: true
          }));
          showCompletionAndRedirect();
        } else {
          // In progress
          setStatus(prev => ({
            ...prev,
            documentCount: currentCount,
            isProcessing: true
          }));
        }
      } catch (error) {
        console.error('Failed to initialize processing:', error);
        setStatus(prev => ({
          ...prev,
          error: 'Failed to initialize document processing'
        }));
      }
    };

    initializeProcessing();
  }, []);

  // Poll for status updates
  useEffect(() => {
    if (!status.isProcessing || status.completed) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/debug');
        const data = await response.json();
        const documentCount = data.collectionInfo?.count || 0;

        setStatus(prev => ({
          ...prev,
          documentCount
        }));

        // Check if processing is complete
        if (documentCount >= 1840) {
          setStatus(prev => ({
            ...prev,
            isProcessing: false,
            completed: true
          }));
          clearInterval(pollInterval);
          showCompletionAndRedirect();
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [status.isProcessing, status.completed]);

  const showCompletionAndRedirect = () => {
    setShowCompletionPopup(true);

    // Auto redirect after 3 seconds
    setTimeout(() => {
      router.push('/');
    }, 3000);
  };

  const progressPercentage = Math.min((status.documentCount / status.totalDocuments) * 100, 100);

  if (status.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Error</h1>
          <p className="text-gray-600 mb-6">{status.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Completion Popup */}
      {showCompletionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Complete!</h2>
            <p className="text-gray-600 mb-4">
              All {status.totalDocuments.toLocaleString()} documents have been successfully processed.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to homepage in 3 seconds...
            </p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-green-600 h-1 rounded-full transition-all duration-1000"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Seva Sahayak
            </h1>
            <p className="text-xl text-gray-600">
              Punjab Government Services AI Assistant
            </p>
          </div>

          {/* Processing Status */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                {status.isProcessing ? 'Processing Documents...' : 'Initializing...'}
              </h2>
            </div>

            <p className="text-gray-600 mb-6">
              We're indexing all Punjab government service documents to provide you with accurate, instant answers.
              This is a one-time process that ensures the best experience for all users.
            </p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{status.documentCount.toLocaleString()} / {status.totalDocuments.toLocaleString()} documents</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {progressPercentage > 10 && (
                    <span className="text-xs text-white font-medium">
                      {Math.round(progressPercentage)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{status.documentCount.toLocaleString()}</div>
                <div className="text-sm text-blue-800">Documents Processed</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">9</div>
                <div className="text-sm text-green-800">Service Categories</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">~2-3</div>
                <div className="text-sm text-purple-800">Minutes Remaining</div>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-semibold text-amber-900">Why This Happens</h3>
                <p className="text-amber-800 mt-1">
                  We're using free hosting which means documents need to be reprocessed periodically.
                  Once complete, the system will be lightning-fast for all users until the next restart.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500">
            <p className="text-sm">
              Please keep this page open. You'll be automatically redirected when processing is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}