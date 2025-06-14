'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface RoleGuardProps {
  children: React.ReactNode;
  featureId: string;
}

export function RoleGuard({ children, featureId }: RoleGuardProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await api.get('/auth/me');
        const user = response.data;
        
        if (!user) {
          router.push('/');
          return;
        }

        setHasAccess(true);
      } catch (error) {
        router.push('/');
      }
    };

    checkAccess();
  }, [router]);

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
} 