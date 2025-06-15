import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, userService } from '@/services/user.service';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface SelectEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (employeeId: string) => void;
}

export function SelectEmployeeDialog({ isOpen, onClose, onSelect }: SelectEmployeeDialogProps) {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEmployees() {
      try {
        setLoading(true);
        const response = await userService.getTeamMembers();
        setEmployees(response);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch team members.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Employee</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No team members found
          </div>
        ) : (
          <div className="space-y-4">
            {employees.map((employee) => (
              <Button
                key={employee.id}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => onSelect(employee.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(employee.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium">{employee.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {employee.designation || employee.role}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 