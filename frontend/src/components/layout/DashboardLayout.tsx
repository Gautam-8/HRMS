'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ChatButton } from '@/components/chat/ChatButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="relative min-h-screen">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className={`min-h-screen ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
        {/* Top Header */}
        <div className="sticky top-0 z-30">
          {/* Mobile Menu Button */}
          <div className={`${isSidebarOpen ? 'hidden' : 'block'} absolute left-4 top-5 z-40`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Navbar */}
          <Navbar />
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
      <ChatButton />
    </div>
  );
} 