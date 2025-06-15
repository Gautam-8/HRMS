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

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await api.get('/users/me');
        setUser(userResponse.data);
        const statsResponse = await api.get('/dashboard/stats');
        setStats(statsResponse.data);
        const departmentsResponse = await api.get('/departments');
        setDepartments(departmentsResponse.data);
        const pendingRequestsResponse = await api.get('/attendance/pending');
        setPendingRequests(pendingRequestsResponse.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = (requestId: string) => {
    // Logic to approve the request
    console.log('Approved request:', requestId);
  };

  const handleReject = (requestId: string) => {
    // Logic to reject the request
    console.log('Rejected request:', requestId);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!user || !stats) return <div>No data available</div>;

  const performanceData = departments.map(dept => ({
    name: dept.name,
    performance: Math.floor(Math.random() * 100), // Placeholder for actual performance data
  }));

  return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
            description="Active employees in organization"
          />
          <StatsCard
            title="Today's Attendance"
            value={stats.todayAttendance}
            icon={Clock}
            description={stats.attendanceDescription}
          />
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <div className="cursor-pointer">
                <StatsCard
                  title="Pending Requests"
                  value={stats.pendingRequests}
                  icon={FileCheck}
                  description="Leave and regularization requests"
                />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pending Requests</DialogTitle>
              </DialogHeader>
              <div className="py-2 max-h-[50vh] overflow-y-auto space-y-4">
                {pendingRequests.length === 0 ? (
                  <div className="text-muted-foreground text-center">No pending requests</div>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request.id} className="flex flex-col gap-1 border-b pb-2 last:border-b-0 last:pb-0">
                      <div className="font-medium">{request.user?.fullName || 'Unknown User'}</div>
                      <div className="text-xs text-muted-foreground">{request.type || 'Leave'} - {request.status}</div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleApprove(request.id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve</button>
                        <button onClick={() => handleReject(request.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <button className="px-4 py-2 bg-muted rounded hover:bg-muted-foreground/10">Close</button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <StatsCard
            title="Onboarding"
            value={stats.onboarding}
            icon={UserPlus}
            description="New employees joining this week"
          />
        </div>

        {/* Department List */}
        <Card className="bg-white shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {departments.map((dept) => (
                <li key={dept.id} className="text-sm">
                  {dept.name} - Manager: {dept.manager?.fullName || 'N/A'} - Employees: {dept.employees?.length || 0}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card className="bg-white shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={600} height={300} data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="performance" fill="#8884d8" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
  );
} 