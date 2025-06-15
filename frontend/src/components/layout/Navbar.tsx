'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Bell,
  LogOut,
  User,
  ChevronDown,
  Briefcase
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/use-auth';

export function Navbar() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/');
  };

  if (!user) return null;

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md shadow-md">
      <div className="h-16 container flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-500" /> {/* Professional Icon */}
          </div>
          <div className="text-sm text-gray-600">
            Organization: {user.organization?.name || 'N/A'}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Welcome, {user.fullName} | Role: {user.role}
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                <User className="h-5 w-5" />
                <span>{user.fullName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
} 