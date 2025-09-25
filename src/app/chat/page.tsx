'use client';

import { ChatInterface } from '@/components/chat/chat-interface';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ChatPage() {
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