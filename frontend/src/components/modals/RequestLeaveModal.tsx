import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DatePickerCalendar } from '@/components/ui/date-picker-calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LeaveType } from '@/services/types';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface RequestLeaveModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { startDate: Date; endDate: Date; type: LeaveType; reason: string }) => void;
}

export function RequestLeaveModal({ open, onClose, onSubmit }: RequestLeaveModalProps) {
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>();
  const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.CASUAL);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!selectedDates?.from || !selectedDates?.to) return;

    onSubmit({
      startDate: selectedDates.from,
      endDate: selectedDates.to,
      type: leaveType,
      reason,
    });

    // Reset form
    setSelectedDates(undefined);
    setLeaveType(LeaveType.CASUAL);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#111827]">Request Leave</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#111827]">Select Dates</label>
              <div className="mt-1.5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
                <DatePickerCalendar
                  mode="range"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  numberOfMonths={2}
                  disabled={{ before: new Date() }}
                />
              </div>
              {selectedDates?.from && selectedDates?.to && (
                <p className="mt-1.5 text-sm text-[#6B7280]">
                  {format(selectedDates.from, 'dd MMM yyyy')} - {format(selectedDates.to, 'dd MMM yyyy')}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#111827]">Leave Type</label>
              <Select value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LeaveType.CASUAL}>Casual Leave</SelectItem>
                  <SelectItem value={LeaveType.SICK}>Sick Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#111827]">Reason</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for leave"
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 text-[13px]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedDates?.from || !selectedDates?.to || !reason}
              className="px-4 py-2 text-[13px]"
            >
              Submit Request
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 