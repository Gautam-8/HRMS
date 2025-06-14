'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type User } from '@/services/user.service';

interface ColumnProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
}

export const columns = ({ onEdit, onDelete, onView }: ColumnProps): ColumnDef<User>[] => [
  {
    accessorKey: 'fullName',
    header: 'Name',
    cell: ({ row }) => {
      const user = row.original;
      const initials = user.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.fullName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'designation',
    header: 'Designation',
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ row }) => {
      const department = row.original.department;
      if (!department) return '-';
      
      return (
        <div>
          <div>{department.name}</div>
          {department.departmentHead?.id === row.original.id && (
            <Badge variant="outline" className="mt-1">Department Head</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.original.role;
      let variant: 'default' | 'secondary' | 'outline' = 'secondary';
      
      switch (role) {
        case 'HR':
          variant = 'default';
          break;
        case 'Manager':
          variant = 'outline';
          break;
        default:
          variant = 'secondary';
      }
      
      return (
        <Badge variant={variant}>
          {role}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(user)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(user)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 