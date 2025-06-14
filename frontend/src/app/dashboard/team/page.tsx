'use client';

import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { userService, type User } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { OnboardUserModal } from '@/components/modals/OnboardUserModal';
import { useToast } from '@/components/ui/use-toast';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TeamPage() {
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { 
    data: users = [], 
    isLoading,
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: userService.getAll,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 0,
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['users'] });
    await queryClient.refetchQueries({ queryKey: ['users'] });
  }, [queryClient]);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setShowOnboardModal(true);
  }, []);

  const handleDelete = useCallback((user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  }, []);

  const handleView = useCallback((user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await userService.delete(selectedUser.id);
      toast({
        title: 'Success',
        description: 'Team member deleted successfully',
      });
      handleRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete team member',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!user?.organization) {
    return <div>Loading organization details...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
          <p className="text-muted-foreground">
            Manage your organization's team members, their roles and departments.
          </p>
        </div>
        <Button onClick={() => setShowOnboardModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Onboard Member
        </Button>
      </div>

      <div className="space-y-4">
        <DataTable 
          columns={columns({ onEdit: handleEdit, onDelete: handleDelete, onView: handleView })} 
          data={(users || []).filter((u: User) => u.organization.id === user.organization.id)}
        />
      </div>

      <OnboardUserModal
        open={showOnboardModal}
        onOpenChange={setShowOnboardModal}
        onSuccess={async () => {
          setShowOnboardModal(false);
          setSelectedUser(null);
          await queryClient.invalidateQueries({ queryKey: ['users'] });
          await queryClient.refetchQueries({ queryKey: ['users'], exact: true });
        }}
        organizationId={user.organization.id}
        mode={selectedUser ? 'edit' : 'create'}
        defaultValues={selectedUser ? {
          id: selectedUser.id,
          fullName: selectedUser.fullName,
          email: selectedUser.email,
          phone: selectedUser.phone,
          role: selectedUser.role,
          designation: selectedUser.designation || '',
          departmentId: selectedUser.department?.id,
        } : undefined}
      />

      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Member Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="font-medium">Full Name</label>
                <p>{selectedUser.fullName}</p>
              </div>
              <div>
                <label className="font-medium">Email</label>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <label className="font-medium">Role</label>
                <p>{selectedUser.role}</p>
              </div>
              <div>
                <label className="font-medium">Designation</label>
                <p>{selectedUser.designation || '-'}</p>
              </div>
              <div>
                <label className="font-medium">Department</label>
                <p>{selectedUser.department?.name || '-'}</p>
              </div>
              <div>
                <label className="font-medium">Phone</label>
                <p>{selectedUser.phone}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team member
              {selectedUser && ` ${selectedUser.fullName}`} and remove them from your organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 