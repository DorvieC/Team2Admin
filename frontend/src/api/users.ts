import apiClient from './client';

export interface AdminUser {
  id: number;
  name?: string;
  status?: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  roleId: number;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export const usersApi = {
  getAll: async (): Promise<AdminUser[]> => {
    const { data } = await apiClient.get<AdminUser[]>('/user');
    return data;
  },

  getById: async (id: number): Promise<AdminUser> => {
    const { data } = await apiClient.get<AdminUser>(`/user/${id}`);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/user/${id}`);
  },

  changeRole: async (id: number, roleId: number): Promise<void> => {
    await apiClient.put(`/user/${id}/role`, { roleId });
  },
};

export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    const { data } = await apiClient.get<Role[]>('/role');
    return data;
  },
};
