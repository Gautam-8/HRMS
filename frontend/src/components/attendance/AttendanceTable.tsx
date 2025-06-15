import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AttendanceStatus } from '@/services/types';
import { DailyAttendance } from '@/services/attendance.service';
import { useToast } from '@/components/ui/use-toast';
import { Pencil, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface AttendanceTableProps {
  data: DailyAttendance[];
  onUpdate?: () => void;
  showActions?: boolean;
  onEdit: (record: DailyAttendance) => void;
}

export function AttendanceTable({ data, onUpdate, showActions = false, onEdit }: AttendanceTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    record: DailyAttendance | null;
  }>({ open: false, record: null });
  const { toast } = useToast();

  // Filter data to show only up to current date
  const currentDate = new Date();
  const filteredData = data
    .filter(record => new Date(record.date) <= currentDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

  const getStatusBadge = (status: AttendanceStatus | null) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[13px] font-medium border bg-gray-100 text-gray-800 border-gray-200">
          Not Checked In
        </span>
      );
    }

    const variants: Record<AttendanceStatus, { bg: string; text: string; border: string }> = {
      [AttendanceStatus.PRESENT]: {
        bg: 'bg-[#ECFDF5]',
        text: 'text-[#059669]',
        border: 'border-[#A7F3D0]'
      },
      [AttendanceStatus.ABSENT]: {
        bg: 'bg-white',
        text: 'text-gray-800',
        border: 'border-gray-200'
      },
      [AttendanceStatus.WEEKEND]: {
        bg: 'bg-[#F3F4F6]',
        text: 'text-[#4B5563]',
        border: 'border-[#E5E7EB]'
      },
      [AttendanceStatus.HOLIDAY]: {
        bg: 'bg-[#EFF6FF]',
        text: 'text-[#2563EB]',
        border: 'border-[#BFDBFE]'
      },
      [AttendanceStatus.LEAVE_PENDING]: {
        bg: 'bg-[#FFFBEB]',
        text: 'text-[#D97706]',
        border: 'border-[#FDE68A]'
      },
      [AttendanceStatus.LEAVE_APPROVED]: {
        bg: 'bg-[#FEF2F2]',
        text: 'text-[#DC2626]',
        border: 'border-[#FECACA]'
      },
      [AttendanceStatus.LEAVE_REJECTED]: {
        bg: 'bg-[#FEF2F2]',
        text: 'text-[#DC2626]',
        border: 'border-[#FECACA]'
      },
      [AttendanceStatus.REGULARIZATION_PENDING]: {
        bg: 'bg-[#FFFBEB]',
        text: 'text-[#D97706]',
        border: 'border-[#FDE68A]'
      }
    };

    const labels: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: 'Present',
      [AttendanceStatus.ABSENT]: 'Not Checked In',
      [AttendanceStatus.WEEKEND]: 'Weekend',
      [AttendanceStatus.HOLIDAY]: 'Holiday',
      [AttendanceStatus.LEAVE_PENDING]: 'Leave Request Pending',
      [AttendanceStatus.LEAVE_APPROVED]: 'Leave',
      [AttendanceStatus.LEAVE_REJECTED]: 'Leave Rejected',
      [AttendanceStatus.REGULARIZATION_PENDING]: 'Regularization Pending'
    };

    const { bg, text, border } = variants[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[13px] font-medium border ${bg} ${text} ${border}`}>
        {labels[status]}
      </span>
    );
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '-';
    return format(new Date(date), 'HH:mm');
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

    setConfirmDialog({ open: true, record });
  };

  const handleConfirmEdit = () => {
    if (confirmDialog.record) {
      onEdit(confirmDialog.record);
      setConfirmDialog({ open: false, record: null });
    }
  };

  return (
    <>
      <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
              <TableHead className="text-[13px] font-medium text-[#6B7280] py-3 px-4">Date</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6B7280] py-3 px-4">Status</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6B7280] py-3 px-4">Check In</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6B7280] py-3 px-4">Check Out</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6B7280] py-3 px-4">Duration</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6B7280] py-3 px-4">Remarks</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6B7280] py-3 px-4 w-[50px]">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((record) => (
              <TableRow key={record.date} className="hover:bg-[#F9FAFB] border-t border-[#E5E7EB]">
                <TableCell className="text-[13px] text-[#111827] py-3 px-4">
                  {format(new Date(record.date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="text-[13px] py-3 px-4">{getStatusBadge(record.status)}</TableCell>
                <TableCell className="text-[13px] text-[#6B7280] py-3 px-4">{formatTime(record.startTime)}</TableCell>
                <TableCell className="text-[13px] text-[#6B7280] py-3 px-4">{formatTime(record.endTime)}</TableCell>
                <TableCell className="text-[13px] text-[#6B7280] py-3 px-4">
                  {record.duration ? `${record.duration}h` : '-'}
                </TableCell>
                <TableCell className="text-[13px] text-[#6B7280] py-3 px-4">{record.reason || '-'}</TableCell>
                <TableCell className="py-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                    onClick={() => handleEditClick(record)}
                    disabled={loading === record.date}
                  >
                    {loading === record.date ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={7} 
                  className="text-[13px] text-[#6B7280] text-center py-6"
                >
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, record: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to edit this attendance record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, record: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmEdit}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 