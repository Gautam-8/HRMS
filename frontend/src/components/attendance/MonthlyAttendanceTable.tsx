import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { DailyAttendance } from '@/services/attendance.service';
import { AttendanceStatus } from '@/services/types';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface MonthlyAttendanceTableProps {
  attendanceData: DailyAttendance[];
  onEditAttendance: (date: string) => void;
}

export const MonthlyAttendanceTable: React.FC<MonthlyAttendanceTableProps> = ({
  attendanceData,
  onEditAttendance,
}) => {
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'bg-green-100 text-green-800';
      case AttendanceStatus.ABSENT:
        return 'bg-red-100 text-red-800';
      case AttendanceStatus.WEEKEND:
        return 'bg-gray-100 text-gray-800';
      case AttendanceStatus.HOLIDAY:
        return 'bg-blue-100 text-blue-800';
      case AttendanceStatus.LEAVE_PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case AttendanceStatus.LEAVE_APPROVED:
        return 'bg-orange-100 text-orange-800';
      case AttendanceStatus.LEAVE_REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceByDate = (date: string) => {
    return attendanceData.find(a => a.date === date) || {
      date,
      id: null,
      status: AttendanceStatus.ABSENT,
      startTime: null,
      endTime: null,
      reason: null,
      leaveType: null,
      duration: null,
    };
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check In
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check Out
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attendanceData.map((day) => {
            const attendance = getAttendanceByDate(day.date);
            return (
              <tr key={day.date}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(day.date), 'dd MMM yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getStatusColor(attendance.status)
                  )}>
                    {attendance.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {attendance.startTime ? format(new Date(attendance.startTime), 'hh:mm a') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {attendance.endTime ? format(new Date(attendance.endTime), 'hh:mm a') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {attendance.duration ? `${attendance.duration}h` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAttendance(day.date)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}; 