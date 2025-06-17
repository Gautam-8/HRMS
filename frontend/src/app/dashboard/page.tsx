'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, FileCheck, UserPlus, AlertTriangle, FileText } from 'lucide-react';
import api from '@/lib/axios';
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

function OrgChartNode({ department }: { department: any }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="font-semibold text-lg mb-2">{department.name}</div>
      {department.departmentHead ? (
        <div className="text-sm text-muted-foreground mb-2">
          Manager: {department.departmentHead.fullName}
        </div>
      ) : (
        <div className="text-sm text-yellow-600 mb-2">
          No manager assigned
        </div>
      )}
      <div className="text-sm">
        {department.employees?.length || 0} employees
      </div>
    </div>
  );
}

function EmployeeCard({ employee }: { employee: any }) {
  return (
    <div className="text-sm p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
      <div className="font-medium">{employee.fullName}</div>
      <div className="text-muted-foreground text-xs mt-1">
        {employee.designation || 'No designation'}
      </div>
      {employee.email && (
        <div className="text-muted-foreground text-xs mt-1">
          {employee.email}
        </div>
      )}
    </div>
  );
}

function EmptyDepartmentState() {
  return (
    <div className="text-center p-6 border-2 border-dashed rounded-lg bg-gray-50">
      <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
      <h3 className="text-sm font-medium text-gray-900">No Employees</h3>
      <p className="text-sm text-gray-500 mt-1">
        This department has no employees yet. Add employees to see them here.
      </p>
    </div>
  );
}

function useDashboardData() {
  const [stats, setStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const user = await userService.getMe();
        if (!user) {
          return;
        }
        setUserRole(user.role);
        const orgId = user.organization?.id;
        const [statsRes, deptRes] = await Promise.all([
          api.get('/dashboard/stats'),
          departmentService.getAll(orgId),
        ]);
        setStats(statsRes.data);
        setDepartments(deptRes.data);
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  return { stats, departments, loading, userRole };
}

export default function DashboardPage() {
  const { stats, departments, loading, userRole } = useDashboardData();
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

      {/* 2nd Row: Full width Org Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Structure</CardTitle>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed rounded-lg bg-gray-50">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No Departments</h3>
              <p className="text-sm text-gray-500 mt-1">
                Your organization has no departments yet. Create departments to organize your employees.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <div key={dept.id} className="relative">
                  <OrgChartNode department={dept} />
                  <div className="mt-4 ml-8 pl-4 border-l-2 border-gray-200">
                    {dept.employees && dept.employees.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {dept.employees.map((employee: any) => (
                          <EmployeeCard key={employee.id} employee={employee} />
                        ))}
                      </div>
                    ) : (
                      <EmptyDepartmentState />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports section - Only visible to HR */}
      {userRole === 'HR' && (
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
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
      )}

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