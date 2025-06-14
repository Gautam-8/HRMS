'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Department } from '@/services/department.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DepartmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
}

export function DepartmentDetailsModal({ isOpen, onClose, department }: DepartmentDetailsModalProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Department Details</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6 flex-1 overflow-hidden">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <h4 className="font-medium text-sm">Name</h4>
                <p className="text-sm text-muted-foreground">{department.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {department.description || 'No description provided'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Total Employees</h4>
                <p className="text-sm text-muted-foreground">{department.employees?.length || 0}</p>
              </div>
            </CardContent>
          </Card>

          {/* Department Head */}
          <Card>
            <CardHeader>
              <CardTitle>Department Head</CardTitle>
            </CardHeader>
            <CardContent>
              {department.departmentHead ? (
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(department.departmentHead.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{department.departmentHead.fullName}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No department head assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Employee List */}
          <Card className="flex-1 overflow-hidden">
            <CardHeader>
              <CardTitle>Employees</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[200px]">
              <CardContent className="space-y-4">
                {department.employees && department.employees.length > 0 ? (
                  department.employees.map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{getInitials(employee.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{employee.fullName}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No employees in this department</p>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 