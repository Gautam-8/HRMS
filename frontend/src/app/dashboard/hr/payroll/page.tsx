'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, FileText } from 'lucide-react';

export default function PayrollPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Payroll</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button>
              <DollarSign className="mr-2 h-4 w-4" />
              Run Payroll
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Current Month Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Payroll</span>
                  <span className="text-sm font-medium">$125,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Processed</span>
                  <span className="text-sm font-medium">$0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-sm font-medium">$125,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tax Filing</span>
                  <span className="text-sm font-medium text-green-600">Up to date</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Insurance</span>
                  <span className="text-sm font-medium text-yellow-600">Due in 5 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Benefits</span>
                  <span className="text-sm font-medium text-green-600">Up to date</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Salary Structure
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Tax Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-sm font-medium">March 2024</p>
                  <p className="text-sm text-muted-foreground">30 Employees</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$125,000</p>
                  <p className="text-sm text-muted-foreground">Processed on Mar 1</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-sm font-medium">February 2024</p>
                  <p className="text-sm text-muted-foreground">28 Employees</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$120,000</p>
                  <p className="text-sm text-muted-foreground">Processed on Feb 1</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 