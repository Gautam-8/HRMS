'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { attendanceService } from '@/services/attendance.service';
import type { DailyAttendance } from '@/services/attendance.service';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { AttendanceStatus, LeaveType, AttendanceType } from '@/services/types';
import { AttendanceEditModal } from '@/components/modals/AttendanceEditModal';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { RequestLeaveModal } from '@/components/modals/RequestLeaveModal';
import { LeaveBalanceCard } from '@/components/attendance/LeaveBalanceCard';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaveBalance {
  casual: { used: number; total: number };
  sick: { used: number; total: number };
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date();
    // Ensure we're in 2025
    if (now.getFullYear() < 2025) {
      now.setFullYear(2025);
    }
    return now;
  });

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    // Ensure we're in 2025
    if (now.getFullYear() < 2025) {
      now.setFullYear(2025);
    }
    return now;
  });

  const [attendanceData, setAttendanceData] = useState<DailyAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DailyAttendance | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    casual: { used: 0, total: 12 },
    sick: { used: 0, total: 12 }
  });
  const [leaveHistory, setLeaveHistory] = useState<{
    date: string;
    type: LeaveType;
    status: string;
  }[]>([]);
  const { toast } = useToast();

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const data = await attendanceService.getMonthlyAttendance(month, year);
      setAttendanceData(data);

      // Get all attendance for current financial year (2025-2026)
      const financialYearStart = new Date(2025, 3, 1); // April 1st, 2025
      const financialYearEnd = new Date(2026, 2, 31); // March 31st, 2026

      const yearlyData = await attendanceService.getYearlyAttendance(
        financialYearStart.toISOString().split('T')[0],
        financialYearEnd.toISOString().split('T')[0]
      );

      // Calculate leave balance
      const leaveCount = yearlyData.reduce((acc: { casual: number; sick: number }, record: DailyAttendance) => {
        if (record.status === AttendanceStatus.LEAVE_APPROVED) {
          if (record.leaveType === LeaveType.CASUAL) {
            acc.casual++;
          } else if (record.leaveType === LeaveType.SICK) {
            acc.sick++;
          }
        }
        return acc;
      }, { casual: 0, sick: 0 });

      setLeaveBalance({
        casual: { used: leaveCount.casual, total: 12 },
        sick: { used: leaveCount.sick, total: 12 }
      });

      // Set leave history
      const history = yearlyData
        .filter(record => record.leaveType && [
          AttendanceStatus.LEAVE_PENDING,
          AttendanceStatus.LEAVE_APPROVED,
          AttendanceStatus.LEAVE_REJECTED
        ].includes(record.status!))
        .map(record => ({
          date: record.date,
          type: record.leaveType!,
          status: record.status === AttendanceStatus.LEAVE_PENDING ? 'Pending' :
                 record.status === AttendanceStatus.LEAVE_APPROVED ? 'Approved' :
                 'Rejected'
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5); // Show only last 5 leave requests

      setLeaveHistory(history);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [currentMonth]);

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      await attendanceService.checkIn();
      toast({
        title: 'Success',
        description: 'Checked in successfully',
      });
      fetchAttendanceData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to check in',
        variant: 'destructive',
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      await attendanceService.checkOut();
      toast({
        title: 'Success',
        description: 'Checked out successfully',
      });
      fetchAttendanceData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to check out',
        variant: 'destructive',
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const handleEditClick = (record: DailyAttendance) => {
    // Don't allow editing of weekends or holidays
    if (record.status === AttendanceStatus.WEEKEND || record.status === AttendanceStatus.HOLIDAY) {
      toast({
        title: 'Cannot edit this record',
        description: 'Weekend and holiday records cannot be edited.',
        variant: 'destructive',
      });
      return;
    }

    // Don't allow editing of future dates
    if (new Date(record.date) > new Date()) {
      toast({
        title: 'Cannot edit future dates',
        description: 'You can only edit past or current dates.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedRecord(record);
    setEditModalOpen(true);
  };

  const handleLeaveSubmit = async (data: {
    startDate: Date;
    endDate: Date;
    type: LeaveType;
    reason: string;
  }) => {
    try {
      await attendanceService.createAttendance({
        type: AttendanceType.LEAVE,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        leaveType: data.type,
        reason: data.reason
      });

      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });

      setLeaveModalOpen(false);
      fetchAttendanceData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit leave request',
        variant: 'destructive',
      });
    }
  };

  const handleRegularizationSubmit = async (data: {
    checkIn: string;
    checkOut: string;
    reason: string;
  }) => {
    try {
      if (!selectedRecord) return;

      if (selectedRecord.id) {
        // Update existing attendance record
        await attendanceService.updateAttendance(selectedRecord.id, {
          startTime: new Date(`${format(new Date(selectedRecord.date), 'yyyy-MM-dd')}T${data.checkIn}`),
          endTime: new Date(`${format(new Date(selectedRecord.date), 'yyyy-MM-dd')}T${data.checkOut}`),
          reason: data.reason,
          status: AttendanceStatus.PRESENT
        });
      } else {
        // Create new attendance record
        await attendanceService.createAttendance({
          type: AttendanceType.REGULAR,
          startDate: selectedRecord.date,
          endDate: selectedRecord.date,
          startTime: `${format(new Date(selectedRecord.date), 'yyyy-MM-dd')}T${data.checkIn}`,
          endTime: `${format(new Date(selectedRecord.date), 'yyyy-MM-dd')}T${data.checkOut}`,
          reason: data.reason
        });
      }

      toast({
        title: 'Success',
        description: 'Attendance regularization request submitted',
      });

      setEditModalOpen(false);
      setSelectedRecord(null);
      fetchAttendanceData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit request',
        variant: 'destructive',
      });
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      // Ensure we stay in 2025
      if (newDate.getFullYear() < 2025) {
        newDate.setFullYear(2025);
      }
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      // Ensure we stay in 2025
      if (newDate.getFullYear() < 2025) {
        newDate.setFullYear(2025);
      }
      return newDate;
    });
  };

  const handleToday = () => {
    const today = new Date();
    // Ensure we're in 2025
    if (today.getFullYear() < 2025) {
      today.setFullYear(2025);
    }
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        {/* Mark Attendance Card Skeleton */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-64" />
              <div className="flex items-center space-x-3">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <Skeleton className="h-[200px] w-full" />
              </div>
              <div className="col-span-9">
                <Skeleton className="h-[400px] w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records Card Skeleton */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
          <div className="p-6">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Mark Attendance Card */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-medium text-[#111827]">
              Mark attendance for today ({format(new Date(), 'dd MMM yyyy')})
            </h2>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setLeaveModalOpen(true)}
                className="bg-white text-black border border-[#E5E7EB] hover:bg-gray-50 rounded-md px-4 py-2 text-[13px] font-medium"
              >
                Request Leave
              </Button>
              <Button 
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="bg-black text-white rounded-md px-4 py-2 text-[13px] font-medium"
              >
                {checkingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Checking In...
                  </>
                ) : 'Check In'}
              </Button>
              <Button 
                onClick={handleCheckOut}
                disabled={checkingOut}
                className="bg-black text-white rounded-md px-4 py-2 text-[13px] font-medium"
              >
                {checkingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Checking Out...
                  </>
                ) : 'Check Out'}
              </Button>
            </div>
          </div>

          {/* Calendar and Leave Balance Grid */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <LeaveBalanceCard 
                balance={leaveBalance}
                history={leaveHistory}
              />
            </div>
            <div className="col-span-9">
              <div className="bg-white rounded-lg border border-[#E5E7EB]">
                <div className="p-4">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-gray-50 rounded-md"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-[13px] font-medium">
                        {format(currentMonth, 'MMMM yyyy')}
                      </span>
                      <button 
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-gray-50 rounded-md"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <button 
                      onClick={handleToday}
                      className="text-[13px] font-medium hover:bg-gray-50 rounded-md px-3 py-1"
                    >
                      Today
                    </button>
                  </div>

                  {/* Calendar */}
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    defaultMonth={currentMonth}
                    attendanceData={attendanceData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records Card */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
        <div className="p-6">
          <h2 className="text-[15px] font-medium text-[#111827] mb-6">
            Attendance Records
          </h2>
          <AttendanceTable 
            data={attendanceData}
            onEdit={handleEditClick}
          />
        </div>
      </div>

      {/* Modals */}
      <AttendanceEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        date={selectedRecord ? new Date(selectedRecord.date) : new Date()}
        onSubmit={handleRegularizationSubmit}
      />

      <RequestLeaveModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onSubmit={handleLeaveSubmit}
      />
    </div>
  );
} 