import apiClient from './client';

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  status?: string;
  method?: string;
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreatePaymentDto {
  orderId: number;
  amount: number;
  method: string;
}

export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    const { data } = await apiClient.get<Payment[]>('/payment');
    return data;
  },

  getById: async (id: number): Promise<Payment> => {
    const { data } = await apiClient.get<Payment>(`/payment/${id}`);
    return data;
  },

  create: async (dto: CreatePaymentDto): Promise<Payment> => {
    const { data } = await apiClient.post<Payment>('/payment', dto);
    return data;
  },

  process: async (id: number): Promise<Payment> => {
    const { data } = await apiClient.post<Payment>(`/payment/${id}/process`);
    return data;
  },
};
