'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import * as Icons from 'lucide-react';
import { getAccessibleFeatures } from '@/lib/features';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const IconComponent = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  // Get features based on user's role
  const accessibleFeatures = user ? getAccessibleFeatures(user.role) : [];

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h2 className="text-2xl font-bold">HRMS</h2>
        {/* <Button variant="ghost" size="icon" onClick={onClose}>
          <Icons.X className="h-6 w-6" />
        </Button> */}
      </div>

      <nav className="space-y-1 p-4">
        {accessibleFeatures.map((feature) => {
          const isActive = pathname === feature.path;
          
          return (
            <Button
              key={feature.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                isActive && "bg-primary/10"
              )}
              onClick={() => router.push(feature.path)}
            >
              {IconComponent(feature.icon)}
              <span className="flex-1 text-left">{feature.label}</span>
              {feature.description && (
                <span className="sr-only">{feature.description}</span>
              )}
            </Button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        <p>HRMS Platform</p>
        <p>Version 1.0.0</p>
      </div>
    </aside>
  );
} 