'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/modals/LoginModal';
import { CreateOrganizationModal } from '@/components/organization/CreateOrganizationModal';
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { userService } from '@/services/user.service';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await userService.getMe();
        router.push('/dashboard');
      } catch (error) {
        // Not authenticated, stay on home page
      }
    };
    
    checkAuth();
  }, [router]);

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
    </main>
  );
}
