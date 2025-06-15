import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface AttendanceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onSubmit: (data: {
    checkIn: string;
    checkOut: string;
    reason: string;
  }) => void;
}

export function AttendanceEditModal({ isOpen, onClose, date, onSubmit }: AttendanceEditModalProps) {
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('18:00');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSubmit({
      checkIn,
      checkOut,
      reason
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Regularize Attendance</DialogTitle>
          <DialogDescription>
            Submit attendance regularization request for {format(date, 'dd MMM yyyy')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Check In Time</label>
              <Input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check Out Time</label>
              <Input
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for regularization"
              className="h-24"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 