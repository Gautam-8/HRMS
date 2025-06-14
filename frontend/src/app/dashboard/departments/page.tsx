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
import { getMe } from '@/services/auth.service';
import { toast } from '@/components/ui/use-toast';
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

export default function DepartmentsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  async function fetchDepartments() {
    try {
      setIsLoading(true);
      const user = await getMe();
      if (user.organizationId) {
        const response = await departmentService.getAll(user.organizationId);
        setOrganizationId(user.organizationId);
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

  if (!organizationId) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Organization Not Found</h2>
          <p className="text-muted-foreground">Please log in with an organization account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
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

      <DataTable 
        columns={columns({
          onEdit: handleEdit,
          onDelete: handleDelete,
          onView: handleView,
        })} 
        data={departments}
        isLoading={isLoading}
      />
      
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