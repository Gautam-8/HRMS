'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, FileCheck, UserPlus } from 'lucide-react';

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: { 
  title: string; 
  value: string; 
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function HRDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Employees"
            value="120"
            icon={Users}
            description="Active employees in organization"
          />
          <StatsCard
            title="Today's Attendance"
            value="92%"
            icon={Clock}
            description="24 employees present today"
          />
          <StatsCard
            title="Pending Requests"
            value="8"
            icon={FileCheck}
            description="Leave and regularization requests"
          />
          <StatsCard
            title="Onboarding"
            value="3"
            icon={UserPlus}
            description="New employees joining this week"
          />
        </div>

        {/* Additional dashboard sections will go here */}
      </div>
    </DashboardLayout>
  );
} 