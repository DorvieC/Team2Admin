import apiClient from './client';
import type { CartItem } from '../types';

export interface CartDto {
  id: number;
  userId: number;
  createdDate?: string;
  updatedDate?: string;
  items: CartItem[];
}

export const cartApi = {
  getMyCart: async (): Promise<CartDto> => {
    const { data } = await apiClient.get<CartDto>('/cart');
    return data;
  },

  addItem: async (productId: number, quantity: number): Promise<CartItem> => {
    const { data } = await apiClient.post<CartItem>('/cart/items', {
      productId,
      quantity,
    });
    return data;
  },

  updateItem: async (itemId: number, quantity: number): Promise<CartItem> => {
    const { data } = await apiClient.put<CartItem>(`/cart/items/${itemId}`, {
      quantity,
    });
    return data;
  },

  deleteItem: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/cart/items/${itemId}`);
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart/items');
  },
};
