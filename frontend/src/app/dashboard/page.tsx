'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, FileCheck, UserPlus } from 'lucide-react';
import api from '@/lib/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { goalsService } from '@/services/goals.service';
import { attendanceService } from '@/services/attendance.service';
import { departmentService } from '@/services/department.service';
import { organizationService } from '@/services/organization.service';
import { userService } from '@/services/user.service';

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
    <Card className="bg-white shadow-md rounded-lg">
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

const COLORS = ['#4F46E5', '#22C55E', '#F59E42', '#EF4444', '#A21CAF'];

function useDashboardData() {
  const [stats, setStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
  const [attendancePie, setAttendancePie] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [onboarding, setOnboarding] = useState<any[]>([]);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const user = await userService.getMe();
        const orgId = user.organization?.id;
        let orgRes = user.organization;
        if (!orgRes && orgId) {
          // fallback: fetch org if not present
          // (implement if needed)
        }
        const [statsRes, deptRes, attendanceSummaryRes] = await Promise.all([
          api.get('/dashboard/stats'),
          departmentService.getAll(orgId),
          api.get('/attendance/summary'),
        ]);
        setStats(statsRes.data);
        setDepartments(deptRes.data);
        setOrg(orgRes);
        // Attendance summary for today
        const { present, absent, leave } = attendanceSummaryRes.data;
        setAttendancePie([
          { name: 'Present', value: present },
          { name: 'Absent', value: absent },
          { name: 'Leave', value: leave },
        ]);
        // Attendance trend (mocked for now)
        const trend = [
          { name: 'Mon', Present: present, Absent: absent, Leave: leave },
        ];
        setAttendanceTrend(trend);
        // Goals
        const goalsRes = await goalsService.getAll();
        setGoals(goalsRes.data);
        // Onboarding
        setOnboarding(statsRes.data.onboardingList || []);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  return { stats, departments, attendanceTrend, attendancePie, goals, onboarding, org, loading };
}

export default function DashboardPage() {
  const { stats, departments, attendanceTrend, attendancePie, goals, onboarding, org, loading } = useDashboardData();

  if (loading) return <div>Loading...</div>;

  // Goal stats
  const activeGoals = goals.filter((g: any) => g.status === 'ACTIVE').length;
  const inReviewGoals = goals.filter((g: any) => g.status === 'IN_REVIEW').length;
  const completedGoals = goals.filter((g: any) => g.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      {/* Organization Info */}
      {org && (
        <div className="flex items-center gap-4 p-4 bg-background rounded-lg shadow">
          <div className="text-2xl font-bold">{org.name}</div>
          <div className="text-muted-foreground">{org.industry}</div>
          <div className="ml-auto text-xs text-muted-foreground">{org.legalName}</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Employees" value={String(stats?.totalEmployees)} icon={Users} description="Active employees" />
        <StatsCard title="Today's Attendance" value={String(stats?.todayAttendance)} icon={Clock} description={stats?.attendanceDescription} />
        <StatsCard title="Pending Requests" value={String(stats?.pendingRequests)} icon={FileCheck} description="Leave/regularization" />
        <StatsCard title="Onboarding" value={String(onboarding.length || stats?.onboarding || 0)} icon={UserPlus} description="Joining this week" />
      </div>

      {/* Department Overview */}
      <Card className="bg-white shadow rounded-lg">
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept: any) => (
              <div key={dept.id} className="border rounded p-3 flex flex-col gap-1">
                <div className="font-semibold">{dept.name}</div>
                <div className="text-xs text-muted-foreground">Manager: {dept.departmentHead?.fullName || 'N/A'}</div>
                <div className="text-xs">Employees: {dept.employees?.length || 0}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Insights */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-white shadow rounded-lg">
          <CardHeader>
            <CardTitle>Attendance Trend (Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Present" fill="#4F46E5" />
                <Bar dataKey="Absent" fill="#EF4444" />
                <Bar dataKey="Leave" fill="#F59E42" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-white shadow rounded-lg">
          <CardHeader>
            <CardTitle>Today's Attendance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={attendancePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {attendancePie.map((entry: any, idx: number) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Goals & Performance */}
      <Card className="bg-white shadow rounded-lg">
        <CardHeader>
          <CardTitle>Goals & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold">{activeGoals}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold">{inReviewGoals}</div>
              <div className="text-xs text-muted-foreground">In Review</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold">{completedGoals}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
          {/* Progress bars for each goal */}
          <div className="mt-4 space-y-2">
            {goals.slice(0, 5).map((goal: any) => (
              <div key={goal.id} className="flex flex-col">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{goal.title}</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded" style={{ width: String(goal.progress) + '%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Progress */}
      <Card className="bg-white shadow rounded-lg">
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {onboarding.length === 0 ? (
            <div className="text-muted-foreground">No employees currently onboarding.</div>
          ) : (
            <ul className="space-y-2">
              {onboarding.map((emp: any) => (
                <li key={emp.id} className="flex items-center gap-2">
                  <span className="font-medium">{emp.fullName}</span>
                  <span className="text-xs text-muted-foreground">{emp.designation}</span>
                  <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Onboarding</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white shadow rounded-lg">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((item: string, idx: number) => (
                <li key={idx} className="text-sm text-muted-foreground">{item}</li>
              ))
            ) : (
              <li className="text-muted-foreground">No recent activity.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 