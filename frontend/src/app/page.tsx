'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/modals/LoginModal';
import { CreateOrganizationModal } from '@/components/organization/CreateOrganizationModal';
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      router.push('/dashboard/hr');
    }
  }, [router]);

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">Welcome to HRMS</h1>
        <div className="flex gap-4">
          <Button onClick={() => setIsLoginModalOpen(true)}>
            Login
          </Button>
          <Button onClick={() => setIsCreateOrgModalOpen(true)} variant="outline">
            Get Started
          </Button>
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
      
      <CreateOrganizationModal
        isOpen={isCreateOrgModalOpen}
        onClose={() => setIsCreateOrgModalOpen(false)}
      />
    </main>
  );
}
