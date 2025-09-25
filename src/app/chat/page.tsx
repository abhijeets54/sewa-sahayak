'use client';

import { ChatInterface } from '@/components/chat/chat-interface';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function ChatContent() {
  const searchParams = useSearchParams();
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setInitialMessage(decodeURIComponent(message));
    }
  }, [searchParams]);

  return <ChatInterface initialMessage={initialMessage} />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}