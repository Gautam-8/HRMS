'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Clock,
  DollarSign,
  ChartBar,
  FileText,
  LogOut,
  Menu,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/hr' },
  { label: 'Employees', icon: Users, href: '/dashboard/hr/employees' },
  { label: 'Attendance', icon: Clock, href: '/dashboard/hr/attendance' },
  { label: 'Payroll', icon: DollarSign, href: '/dashboard/hr/payroll' },
  { label: 'Performance', icon: ChartBar, href: '/dashboard/hr/performance' },
  { label: 'Reports', icon: FileText, href: '/dashboard/hr/reports' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h2 className="text-2xl font-bold">HRMS</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <nav className="space-y-1 p-4">
          {sidebarItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => router.push(item.href)}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`min-h-screen ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b bg-white">
          <div className="flex h-full items-center justify-between px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className={isSidebarOpen ? 'hidden' : 'block'}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-4">
              {/* Add user profile, notifications, etc. here */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 