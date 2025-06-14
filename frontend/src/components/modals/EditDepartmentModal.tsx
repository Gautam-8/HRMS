'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { departmentService, type Department } from '@/services/department.service';
import { userService, type User } from '@/services/user.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  departmentHeadId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  department: Department;
}

export function EditDepartmentModal({ isOpen, onClose, onSuccess, department }: EditDepartmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: department.name,
      description: department.description || '',
      departmentHeadId: department.departmentHead?.id,
    },
  });

  useEffect(() => {
    async function fetchManagers() {
      try {
        const managers = await userService.getManagers(department.organization.id);
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

    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen, department.organization.id, toast]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await departmentService.update(department.id, values);
      
      toast({
        title: 'Success',
        description: 'Department updated successfully',
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update department',
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
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter department name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter department description" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentHeadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Head</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department head" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Department'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 