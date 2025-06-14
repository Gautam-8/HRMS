'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
            <Button>
              <Clock className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Present</span>
                  <span className="text-sm font-medium">24/30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Absent</span>
                  <span className="text-sm font-medium">4/30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">On Leave</span>
                  <span className="text-sm font-medium">2/30</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department-wise View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Engineering</span>
                  <span className="text-sm font-medium">95%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Design</span>
                  <span className="text-sm font-medium">88%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Marketing</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">Sick Leave</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Reject</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Jane Smith</p>
                    <p className="text-sm text-muted-foreground">Vacation</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Reject</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Log</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add attendance table here */}
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 