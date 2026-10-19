import apiClient from './client';
import type { Review, CreateReviewDto } from '../types';

export const reviewsApi = {
  getByProduct: async (productId: number): Promise<Review[]> => {
    const { data } = await apiClient.get<Review[]>(`/review?productId=${productId}`);
    return data;
  },

  getAll: async (): Promise<Review[]> => {
    const { data } = await apiClient.get<Review[]>('/review');
    return data;
  },

  create: async (dto: CreateReviewDto): Promise<Review> => {
    const { data } = await apiClient.post<Review>('/review', dto);
    return data;
  },

  update: async (id: number, dto: Partial<CreateReviewDto>): Promise<Review> => {
    const { data } = await apiClient.put<Review>(`/review/${id}`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/review/${id}`);
  },
};
