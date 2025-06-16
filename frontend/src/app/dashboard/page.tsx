'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, FileCheck, UserPlus, AlertTriangle, FileText } from 'lucide-react';
import api from '@/lib/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ResponsiveContainer } from 'recharts';
import { attendanceService } from '@/services/attendance.service';
import { departmentService } from '@/services/department.service';
import { userService } from '@/services/user.service';
import { ViewAnomaliesModal } from '@/components/anomalies/ViewAnomaliesModal';
import { AnomalyType } from '@/types/anomalies';
import { Button } from '@/components/ui/button';

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

function useDashboardData() {
  const [stats, setStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const user = await userService.getMe();
        const orgId = user.organization?.id;
        const [statsRes, deptRes, attendanceSummaryRes] = await Promise.all([
          api.get('/dashboard/stats'),
          departmentService.getAll(orgId),
          api.get('/attendance/summary'),
        ]);
        setStats(statsRes.data);
        setDepartments(deptRes.data);
        
        // Attendance trend
        const { present, absent, leave } = attendanceSummaryRes.data;
        const trend = [
          { name: 'Mon', Present: present, Absent: absent, Leave: leave },
          { name: 'Tue', Present: present + 2, Absent: absent - 1, Leave: leave },
          { name: 'Wed', Present: present + 1, Absent: absent, Leave: leave + 1 },
          { name: 'Thu', Present: present - 1, Absent: absent + 1, Leave: leave },
          { name: 'Fri', Present: present, Absent: absent, Leave: leave },
        ];
        setAttendanceTrend(trend);
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  return { stats, departments, attendanceTrend, loading };
}

export default function DashboardPage() {
  const { stats, departments, attendanceTrend, loading } = useDashboardData();
  const [showAttendanceAnomalies, setShowAttendanceAnomalies] = useState(false);
  const [showPayrollAnomalies, setShowPayrollAnomalies] = useState(false);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Reports and analytics for your organization
          </p>
        </div>
      </div>

      {/* 1st Row: Four StatsCards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Total Employees" value={String(stats?.totalEmployees)} icon={Users} description="Active employees" />
        <StatsCard title="Today's Attendance" value={String(stats?.todayAttendance)} icon={Clock} description={stats?.attendanceDescription} />
        <StatsCard title="Pending Requests" value={String(stats?.pendingRequests)} icon={FileCheck} description="Leave/regularization" />
        <StatsCard title="Departments" value={String(departments.length)} icon={UserPlus} description="Active departments" />
      </div>

      {/* 2nd Row: Reports section & Attendance graph */}
      <div className="grid gap-4 md:grid-cols-2 items-stretch">
        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Standard Reports */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Standard Reports</h3>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Attendance Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Leave Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Performance Report
                  </Button>
                </div>
              </div>
              {/* AI Reports */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">AI Reports</h3>
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowAttendanceAnomalies(true)}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Attendance Anomalies
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowPayrollAnomalies(true)}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Payroll Anomalies
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Attendance Graph */}
        <Card className="p-0 h-64 flex flex-col">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base">Attendance Trend (Week)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end pt-0 pb-2 px-2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Present" fill="#4F46E5" />
                <Bar dataKey="Absent" fill="#EF4444" />
                <Bar dataKey="Leave" fill="#F59E42" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3rd Row: Departments full width */}
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departments.map((dept: any) => (
              <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-semibold">{dept.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Manager: {dept.departmentHead?.fullName || 'N/A'}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {dept.employees?.length || 0} employees
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ViewAnomaliesModal
        isOpen={showAttendanceAnomalies}
        onClose={() => setShowAttendanceAnomalies(false)}
        type={AnomalyType.ATTENDANCE}
      />
      <ViewAnomaliesModal
        isOpen={showPayrollAnomalies}
        onClose={() => setShowPayrollAnomalies(false)}
        type={AnomalyType.SALARY}
      />
    </div>
  );
} 