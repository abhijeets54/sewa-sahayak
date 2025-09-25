'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle, FileText, Users, Clock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EXAMPLE_QUESTIONS = [
  "How to apply for residence certificate",
  "Documents required for birth certificate",
  "How to apply for income certificate step by step process",
  "What is the application process for Punjab residence certificate?",
  "Birth certificate application requirements and timeline",
  "Income certificate documents and application procedure"
];

const FEATURES = [
  {
    icon: MessageCircle,
    title: "24/7 AI Assistant",
    description: "Get instant answers to your government service queries anytime"
  },
  {
    icon: FileText,
    title: "Official Documentation",
    description: "Answers based on verified Punjab government documents and procedures"
  },
  {
    icon: Clock,
    title: "Quick Response",
    description: "Get detailed information within seconds, no waiting in queues"
  },
  {
    icon: Shield,
    title: "Accurate Information",
    description: "Reliable information with proper source citations from official documents"
  }
];

export function LandingPage() {
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = (questionText: string) => {
    if (!questionText.trim()) return;

    const encodedMessage = encodeURIComponent(questionText.trim());
    router.push(`/chat?message=${encodedMessage}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(message);
  };

  const handleExampleClick = (example: string) => {
    handleSubmit(example);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Seva Sahayak
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your AI-powered assistant for Punjab Government Services
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Get instant answers about certificates, applications, fees, and procedures
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">
              Ask me anything about Punjab Government services
            </h2>

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="mb-12">
              <div className="flex gap-4 items-end max-w-3xl mx-auto">
                <div className="flex-1">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your question here... (e.g., How do I apply for residence certificate?)"
                    className="min-h-[60px] max-h-[120px] text-base"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleFormSubmit(e);
                      }
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!message.trim()}
                  className="h-[60px] px-8 bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Ask Now
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Press Enter to submit, Shift + Enter for new line
              </p>
            </form>

            {/* Example Questions */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Popular Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXAMPLE_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(question)}
                    className="p-4 text-left bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <p className="text-sm text-gray-700 group-hover:text-primary-600">
                      {question}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center text-gray-900 mb-12">
            Why Choose Seva Sahayak?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">1,840+</div>
              <div className="text-gray-600">Document Chunks Indexed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">9</div>
              <div className="text-gray-600">Government Service Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Available Support</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System Online</span>
              </div>
              <div className="text-sm text-gray-500">•</div>
              <div className="text-sm text-gray-600">
                Helpline: <a href="tel:1100" className="text-primary-600 hover:underline">1100</a>
              </div>
              <div className="text-sm text-gray-500">•</div>
              <div className="text-sm text-gray-600">
                Website: <a href="https://connect.punjab.gov.in" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">connect.punjab.gov.in</a>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Punjab Government Services • Powered by AI • Official Information Only
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}