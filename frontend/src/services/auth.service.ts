import api from '@/lib/axios';
import Cookies from 'js-cookie';
import { User } from './user.service';

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', data);
  Cookies.set('token', response.data.access_token, { expires: 7 }); // 7 days expiry
  return response.data;
};

export const logout = () => {
  Cookies.remove('token');
};
