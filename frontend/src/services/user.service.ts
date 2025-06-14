import api from '@/lib/axios';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  designation?: string;
}

export const userService = {
  getManagers: (organizationId: string) => 
    api.get<User[]>('/users/managers', {
      params: { organizationId }
    }),
}; 