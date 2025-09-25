'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, FileText, Clock, Shield } from 'lucide-react';

interface WelcomeScreenProps {
  onExampleClick?: (example: string) => void;
}

const exampleQuestions = [
  "How do I apply for a residence certificate?",
  "What documents are needed for income certificate?",
  "Where can I find the nearest government office?",
  "How long does it take to get a caste certificate?",
];

const features = [
  {
    icon: MessageSquare,
    title: "Natural Language Queries",
    description: "Ask questions in simple Punjabi or English"
  },
  {
    icon: FileText,
    title: "Official Documents",
    description: "Answers based on verified government PDFs"
  },
  {
    icon: Clock,
    title: "Instant Responses",
    description: "Get immediate help 24/7"
  },
  {
    icon: Shield,
    title: "Reliable Information",
    description: "All responses include source citations"
  }
];

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto">
          <MessageSquare className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Seva Sahayak
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your AI-powered assistant for Punjab Government services. Get instant, accurate answers
          to all your questions about government procedures, documents, and services.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Example Questions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          Try asking me something like:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exampleQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => onExampleClick?.(question)}
              className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 group-hover:text-primary-700">
                  {question}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This assistant provides information based on available government documents.
              For official procedures, please verify with the respective government office.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}