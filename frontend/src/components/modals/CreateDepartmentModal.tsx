'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { departmentService } from '@/services/department.service';
import { userService, type User } from '@/services/user.service';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
}

export function CreateDepartmentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  organizationId 
}: CreateDepartmentModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchManagers() {
      try {
        const managers = await userService.getManagers(organizationId);
        setManagers(managers || []);
      } catch (error) {
        console.error('Failed to fetch managers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load managers',
          variant: 'destructive',
        });
        setManagers([]);
      }
    }

    if (isOpen && organizationId) {
      fetchManagers();
    }
  }, [isOpen, organizationId, toast]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Department name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await departmentService.create({
        name: name.trim(),
        description: description.trim(),
        organizationId,
        departmentHeadId: selectedManagerId || undefined
      });
      
      toast({
        title: 'Success',
        description: 'Department created successfully',
      });
      
      setName('');
      setDescription('');
      setSelectedManagerId('');
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create department',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Department</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter department name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter department description"
            />
          </div>

          <div className="space-y-2">
            <Label>Department Head</Label>
            <Select
              value={selectedManagerId}
              onValueChange={setSelectedManagerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a department head" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((manager) => (
                  <SelectItem 
                    key={manager.id} 
                    value={manager.id}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(manager.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{manager.fullName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Department'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 