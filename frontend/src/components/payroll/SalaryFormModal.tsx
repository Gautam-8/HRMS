import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/services/user.service';
import { Salary } from '@/services/salary.service';

interface SalaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Salary>) => void;
  initialData?: Partial<Salary>;
  users: User[];
  isEdit?: boolean;
}

export function SalaryFormModal({ isOpen, onClose, onSubmit, initialData, users, isEdit }: SalaryFormModalProps) {
  const [userId, setUserId] = useState(initialData?.user?.id || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate || '');

  useEffect(() => {
    setUserId(initialData?.user?.id || '');
    setAmount(initialData?.amount?.toString() || '');
    setEffectiveDate(initialData?.effectiveDate || '');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !amount || !effectiveDate) return;
    onSubmit({
      user: { id: userId } as User,
      amount: parseFloat(amount),
      effectiveDate,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Salary' : 'Add Salary'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              disabled={isEdit}
              required
            >
              <option value="">Select user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
            <Input
              type="number"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Effective Date</label>
            <Input
              type="date"
              value={effectiveDate}
              onChange={e => setEffectiveDate(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEdit ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

