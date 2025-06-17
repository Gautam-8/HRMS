'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { PolicyUpload } from './PolicyUpload';
import { useAuth } from '@/hooks/use-auth';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogTitle className="text-2xl font-bold">
            HR Assistant
          </DialogTitle>
          <p className="text-sm text-muted-foreground mb-4">
            Get instant answers to your HR-related questions
          </p>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {user?.role === 'HR' && <PolicyUpload />}
            <div className="flex-1 min-h-0">
              <ChatWindow />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 