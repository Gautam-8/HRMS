"use client"

import * as React from "react"
import { DayPicker, DayProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"
import { AttendanceStatus } from "@/services/types"
import { format, isWeekend } from "date-fns"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  attendanceData?: {
    date: string;
    status: AttendanceStatus | null;
    startTime: Date | null;
    endTime: Date | null;
  }[];
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  attendanceData = [],
  month,
  defaultMonth,
  onMonthChange,
  ...props
}: CalendarProps) {
  const getStatusColor = (date: Date) => {
    // Check if it's a weekend (Sunday = 0, Saturday = 6)
    const dayOfWeek = date.getDay();
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekendDay) {
      return 'bg-[#F3F4F6] hover:bg-[#E5E7EB]';
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const attendance = attendanceData.find(a => a.date === dateStr);

    if (!attendance || !attendance.status) return 'bg-white';

    // Ignore WEEKEND status from attendance data if it doesn't match actual weekend
    if (attendance.status === AttendanceStatus.WEEKEND) {
      const attendanceDate = new Date(attendance.date);
      const attendanceDayOfWeek = attendanceDate.getDay();
      if (attendanceDayOfWeek !== 0 && attendanceDayOfWeek !== 6) {
        return 'bg-white';
      }
    }

    const colors: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: 'bg-[#ECFDF5] hover:bg-[#D1FAE5]',
      [AttendanceStatus.ABSENT]: 'bg-white hover:bg-gray-50',
      [AttendanceStatus.WEEKEND]: 'bg-[#F3F4F6] hover:bg-[#E5E7EB]',
      [AttendanceStatus.HOLIDAY]: 'bg-[#EFF6FF] hover:bg-[#DBEAFE]',
      [AttendanceStatus.LEAVE_PENDING]: 'bg-[#FFFBEB] hover:bg-[#FEF3C7]',
      [AttendanceStatus.LEAVE_APPROVED]: 'bg-[#FEF2F2] hover:bg-[#FEE2E2]',
      [AttendanceStatus.LEAVE_REJECTED]: 'bg-[#FEF2F2] hover:bg-[#FEE2E2]',
      [AttendanceStatus.REGULARIZATION_PENDING]: 'bg-[#FFFBEB] hover:bg-[#FEF3C7]'
    };

    return colors[attendance.status];
  };

  const getStatusLabel = (date: Date) => {
    // Check if it's a weekend (Sunday = 0, Saturday = 6)
    const dayOfWeek = date.getDay();
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekendDay) {
      return 'Weekend';
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const attendance = attendanceData.find(a => a.date === dateStr);

    if (!attendance || !attendance.status) return 'Not Checked In';

    // Ignore WEEKEND status from attendance data if it doesn't match actual weekend
    if (attendance.status === AttendanceStatus.WEEKEND) {
      const attendanceDate = new Date(attendance.date);
      const attendanceDayOfWeek = attendanceDate.getDay();
      if (attendanceDayOfWeek !== 0 && attendanceDayOfWeek !== 6) {
        return 'Not Checked In';
      }
    }

    const labels: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: 'Present',
      [AttendanceStatus.ABSENT]: 'Not Checked In',
      [AttendanceStatus.WEEKEND]: 'Weekend',
      [AttendanceStatus.HOLIDAY]: 'Holiday',
      [AttendanceStatus.LEAVE_PENDING]: 'Leave Request Pending',
      [AttendanceStatus.LEAVE_APPROVED]: 'Leave Approved',
      [AttendanceStatus.LEAVE_REJECTED]: 'Leave Rejected',
      [AttendanceStatus.REGULARIZATION_PENDING]: 'Regularization Pending'
    };

    let label = labels[attendance.status];
    if (attendance.startTime) {
      label += ` (${new Date(attendance.startTime).toLocaleTimeString()} - ${
        attendance.endTime ? new Date(attendance.endTime).toLocaleTimeString() : 'ongoing'
      })`;
    }

    return label;
  };

  const getDayStyle = (date: Date) => {
    // Check if it's a weekend (Sunday = 0, Saturday = 6)
    const dayOfWeek = date.getDay();
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekendDay) {
      return 'border-l-4 border-[#6B7280]';
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const attendance = attendanceData.find(a => a.date === dateStr);

    if (!attendance || !attendance.status) return '';

    // Ignore WEEKEND status from attendance data if it doesn't match actual weekend
    if (attendance.status === AttendanceStatus.WEEKEND) {
      const attendanceDate = new Date(attendance.date);
      const attendanceDayOfWeek = attendanceDate.getDay();
      if (attendanceDayOfWeek !== 0 && attendanceDayOfWeek !== 6) {
        return '';
      }
    }

    const styles: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: 'border-[#059669]',
      [AttendanceStatus.ABSENT]: '',
      [AttendanceStatus.WEEKEND]: 'border-[#6B7280]',
      [AttendanceStatus.HOLIDAY]: 'border-[#2563EB]',
      [AttendanceStatus.LEAVE_PENDING]: 'border-[#D97706]',
      [AttendanceStatus.LEAVE_APPROVED]: 'border-[#DC2626]',
      [AttendanceStatus.LEAVE_REJECTED]: 'border-[#DC2626]',
      [AttendanceStatus.REGULARIZATION_PENDING]: 'border-[#D97706]'
    };

    return `border-l-4 ${styles[attendance.status]}`;
  };

  return (
    <DayPicker
      month={month}
      defaultMonth={defaultMonth}
      onMonthChange={onMonthChange}
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "w-full",
        caption: "hidden",
        nav: "hidden",
        table: "w-full",
        head_row: "grid grid-cols-7 mb-2",
        head_cell: "text-[13px] font-normal text-[#6B7280] h-9 w-9 flex items-center justify-center",
        row: "grid grid-cols-7 gap-0",
        cell: cn(
          "relative text-center text-[13px] p-0 h-9 w-9 flex items-center justify-center",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal text-[13px] aria-selected:opacity-100 rounded-md flex items-center justify-center text-[#111827]",
          "transition-colors duration-200 ease-in-out"
        ),
        day_selected: "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white rounded-md",
        day_today: "bg-gray-50 text-[#111827] rounded-md",
        day_outside: "text-[#6B7280]",
        day_disabled: "text-[#6B7280]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => null,
        IconRight: () => null,
        Day: ({ date, displayMonth, ...dayProps }: DayProps & { className?: string }) => {
          // Only render days that belong to the current month
          const isSameMonth = date.getMonth() === displayMonth.getMonth();
          if (!isSameMonth && !showOutsideDays) {
            return <div className="h-9 w-9" />;
          }

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    {...dayProps}
                    className={cn(
                      dayProps.className,
                      getStatusColor(date),
                      getDayStyle(date),
                      !isSameMonth && "text-[#6B7280] opacity-50"
                    )}
                  >
                    {date.getDate()}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getStatusLabel(date)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
