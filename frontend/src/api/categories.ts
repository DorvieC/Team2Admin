import apiClient from './client';

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentCategoryId?: number;
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/category');
    return data;
  },

  getById: async (id: number): Promise<Category> => {
    const { data } = await apiClient.get<Category>(`/category/${id}`);
    return data;
  },

  create: async (dto: CreateCategoryDto): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/category', dto);
    return data;
  },

  update: async (id: number, dto: CreateCategoryDto): Promise<Category> => {
    const { data } = await apiClient.put<Category>(`/category/${id}`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/category/${id}`);
  },
};
