import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Employee' | 'Manager' | 'HR';
  organizationId: string;
  departmentId: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
})); 