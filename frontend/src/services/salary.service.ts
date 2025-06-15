import api from '@/lib/axios';
import { User } from './user.service';

export interface Salary {
  id: string;
  user: User;
  amount: number;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

class SalaryService {
  async getAll() {
    return api.get<Salary[]>('/salaries');
  }

  async getByUser(userId: string) {
    return api.get<Salary[]>(`/salaries/user?userId=${userId}`);
  }

  async create(data: Partial<Salary>) {
    return api.post<Salary>('/salaries', data);
  }

  async update(id: string, data: Partial<Salary>) {
    return api.put<Salary>(`/salaries/${id}`, data);
  }

  async remove(id: string) {
    return api.delete(`/salaries/${id}`);
  }
}

export const salaryService = new SalaryService();
