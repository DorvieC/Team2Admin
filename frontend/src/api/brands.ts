import apiClient from './client';

export interface Brand {
  id: number;
  name: string;
}

export const brandsApi = {
  getAll: async (): Promise<Brand[]> => {
    const { data } = await apiClient.get<Brand[]>('/brand');
    return data;
  },
};
