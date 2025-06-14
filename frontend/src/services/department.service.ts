import api from '@/lib/axios';
import { Organization } from './organization.service';
import { User } from './user.service';

export interface Department {
  id: string;
  name: string;
  description?: string;
  organization: Organization;
  departmentHead?: User;
  employees?: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  organizationId: string;
  departmentHeadId?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  departmentHeadId?: string;
}

export const departmentService = {
  getAll: (organizationId: string) => 
    api.get<Department[]>('/departments', {
      params: { organizationId }
    }),
  
  getOne: (id: string) => 
    api.get<Department>(`/departments/${id}`),
  
  create: (data: CreateDepartmentDto) => 
    api.post<Department>('/departments', data),
  
  update: (id: string, data: Partial<CreateDepartmentDto>) =>
    api.patch<Department>(`/departments/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/departments/${id}`),
  
  assignHead: (departmentId: string, userId: string) =>
    api.patch<Department>(`/departments/${departmentId}/head`, { userId }),
}; 