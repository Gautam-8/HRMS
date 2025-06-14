'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Department } from '@/services/department.service';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ColumnActions {
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  onView: (department: Department) => void;
}

export const columns = ({
  onEdit,
  onDelete,
  onView,
}: ColumnActions): ColumnDef<Department>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => row.original.description || 'No description',
  },
  {
    accessorKey: 'departmentHead',
    header: 'Department Head',
    cell: ({ row }) => {
      const head = row.original.departmentHead;
      if (!head) return 'Not assigned';

      const getInitials = (name: string) => {
        return name
          .split(' ')
          .map((word) => word[0])
          .join('')
          .toUpperCase();
      };

      return (
        <div className='flex items-center space-x-2'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback>{getInitials(head.fullName)}</AvatarFallback>
          </Avatar>
          <span>{head.fullName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'employeeCount',
    header: 'Employees',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const department = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(department)}>
              <Eye className='mr-2 h-4 w-4' />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(department)}>
              <Pencil className='mr-2 h-4 w-4' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(department)}
              className='text-red-600'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 