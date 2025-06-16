'use client';

import { ChatWindow } from '@/components/chat/ChatWindow';
import { PolicyUpload } from '@/components/chat/PolicyUpload';

export default function ChatPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">HR Assistant</h2>
          <p className="text-muted-foreground">
            Get instant answers to your HR-related questions
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        <PolicyUpload />
        <ChatWindow />
      </div>
    </div>
  );
} 