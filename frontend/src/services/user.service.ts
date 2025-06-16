import api from '@/lib/axios';
import { Department } from './department.service';
import { Organization } from './organization.service';

export type UserRole = 'CEO' | 'CTO' | 'HR' | 'Manager' | 'Employee';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string;
  designation?: string;
  department?: Department;
  organization: Organization;
  departmentsManaged?: Department[];
  createdAt: Date;
  updatedAt: Date;
  isOnboarded?: boolean;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  designation?: string;
  departmentId?: string;
  organizationId: string;
  isOnboarded?: boolean;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  departmentId?: string;
}

// Service methods matching backend endpoints
export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getOne: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  getManagers: async (organizationId: string): Promise<User[]> => {
    const response = await api.get('/users/managers', {
      params: { organizationId }
    });
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getTeamMembers: async (): Promise<User[]> => {
    const response = await api.get('/users/team');
    return response.data;
  }
}; 