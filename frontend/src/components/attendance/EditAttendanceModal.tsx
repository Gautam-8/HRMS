import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DailyAttendance } from '@/services/attendance.service';
import { AttendanceStatus, LeaveType } from '@/services/types';
import { format } from 'date-fns';

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: DailyAttendance;
  onSave: (data: Partial<DailyAttendance>) => Promise<void>;
}

export const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({
  isOpen,
  onClose,
  attendance,
  onSave,
}) => {
  const [status, setStatus] = React.useState<AttendanceStatus>(attendance.status);
  const [startTime, setStartTime] = React.useState(
    attendance.startTime ? format(new Date(attendance.startTime), "HH:mm") : ""
  );
  const [endTime, setEndTime] = React.useState(
    attendance.endTime ? format(new Date(attendance.endTime), "HH:mm") : ""
  );
  const [reason, setReason] = React.useState(attendance.reason || "");
  const [leaveType, setLeaveType] = React.useState<LeaveType | null>(attendance.leaveType);
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const date = new Date(attendance.date);
      
      const data: Partial<DailyAttendance> = {
        status,
        startTime: startTime ? new Date(date.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]))) : null,
        endTime: endTime ? new Date(date.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]))) : null,
        reason: reason || null,
        leaveType: leaveType || null,
      };

      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Failed to save attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Attendance - {format(new Date(attendance.date), 'dd MMM yyyy')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(value) => setStatus(value as AttendanceStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AttendanceStatus.PRESENT}>Present</SelectItem>
                <SelectItem value={AttendanceStatus.ABSENT}>Absent</SelectItem>
                <SelectItem value={AttendanceStatus.LEAVE_PENDING}>Leave (Pending)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === AttendanceStatus.PRESENT && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-in Time</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-out Time</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </>
          )}

          {status === AttendanceStatus.LEAVE_PENDING && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Leave Type</label>
                <Select
                  value={leaveType || undefined}
                  onValueChange={(value) => setLeaveType(value as LeaveType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LeaveType.CASUAL}>Casual Leave</SelectItem>
                    <SelectItem value={LeaveType.SICK}>Sick Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for leave"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 