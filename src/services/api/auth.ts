import client from './client';
import type { User } from '../../types';

export const authApi = {
  login: (email: string, password: string) =>
    client.post<any, { user: User; token: string }>('/auth/login', { email, password }),

  register: (email: string, password: string, username: string) =>
    client.post<any, { user: User; token: string }>('/auth/register', { email, password, username }),

  logout: () => client.post('/auth/logout'),

  getProfile: () => client.get<any, User>('/auth/profile'),

  updateProfile: (data: Partial<User>) => client.put('/auth/profile', data),

  changePassword: (oldPassword: string, newPassword: string) =>
    client.put('/auth/password', { oldPassword, newPassword }),
};
