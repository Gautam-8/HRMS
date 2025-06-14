'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { CreateDepartmentModal } from '@/components/modals/CreateDepartmentModal';
import { EditDepartmentModal } from '@/components/modals/EditDepartmentModal';
import { DepartmentDetailsModal } from '@/components/modals/DepartmentDetailsModal';
import { departmentService, type Department } from '@/services/department.service';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
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
import { userService } from '@/services/user.service';

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>
      
      <div className="rounded-md border">
        <div className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  async function fetchDepartments() {
    try {
      setIsLoading(true);
      const user = await userService.getMe();
      if (user.organization.id) {
        const response = await departmentService.getAll(user.organization.id);
        setOrganizationId(user.organization.id);
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleView = async (department: Department) => {
    try {
      const response = await departmentService.getOne(department.id);
      setSelectedDepartment(response.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load department details',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditModalOpen(true);
  };

  const handleDelete = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDepartment) return;

    try {
      await departmentService.delete(selectedDepartment.id);
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });
      fetchDepartments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete department',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDepartment(null);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchDepartments();
  };

  if (isInitialLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="p-6">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h2 className="mt-4 text-xl font-semibold">No Departments Found</h2>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Get started by creating your first department.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage your organization's departments and their structure
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="space-y-3">
            <div className="h-4 w-[250px] animate-pulse rounded bg-muted"></div>
            <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
          </div>
          <div className="h-[400px] w-full animate-pulse rounded-lg bg-muted"></div>
        </div>
      ) : departments.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No departments</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Create your first department to start managing your organization structure.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </div>
        </div>
      ) : (
        <DataTable 
          columns={columns({
            onEdit: handleEdit,
            onDelete: handleDelete,
            onView: handleView,
          })} 
          data={departments}
          isLoading={isLoading}
        />
      )}
      
      <CreateDepartmentModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        organizationId={organizationId}
      />

      {selectedDepartment && (
        <>
          <EditDepartmentModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedDepartment(null);
            }}
            onSuccess={fetchDepartments}
            department={selectedDepartment}
          />

          <DepartmentDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedDepartment(null);
            }}
            department={selectedDepartment}
          />
        </>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the department &quot;{selectedDepartment?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedDepartment(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 