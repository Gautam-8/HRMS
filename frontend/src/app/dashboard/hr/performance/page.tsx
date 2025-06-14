'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartBar, Star, Target } from 'lucide-react';

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Performance</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Set Goals
            </Button>
            <Button>
              <Star className="mr-2 h-4 w-4" />
              Start Review
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Review Cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Q1 2024 Review</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="text-sm font-medium">15/30</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-2 w-1/2 rounded-full bg-blue-600" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Q4 2023 Review</h3>
                  <p className="text-sm text-green-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Engineering</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Design</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Marketing</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Goals Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">Increase Revenue</h3>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-100">
                    <div className="h-2 w-3/4 rounded-full bg-green-600" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">Customer Satisfaction</h3>
                    <span className="text-sm font-medium">90%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-100">
                    <div className="h-2 w-[90%] rounded-full bg-green-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add chart here */}
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-900">
                    Team collaboration scores have improved by 15% this quarter.
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-green-900">
                    Employee satisfaction is trending upward based on recent survey data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 