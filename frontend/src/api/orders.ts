import apiClient from './client';

export interface CreateOrderDto {
  deliveryAddress: string;
  phone: string;
  comment?: string;
  paymentMethod?: string;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderDto {
  id: number;
  userId?: number;
  orderStatus: string;
  totalAmount: number;
  deliveryAddress: string;
  phone: string;
  comment?: string;
  paymentMethod?: string;
  createdDate?: string;
  updatedDate?: string;
  items: OrderItemDto[];
}

export const ordersApi = {
  create: async (dto: CreateOrderDto): Promise<OrderDto> => {
    const { data } = await apiClient.post<OrderDto>('/order', dto);
    return data;
  },

  getMyOrders: async (): Promise<OrderDto[]> => {
    const { data } = await apiClient.get<OrderDto[]>('/order/my');
    return data;
  },

  getAll: async (): Promise<OrderDto[]> => {
    const { data } = await apiClient.get<OrderDto[]>('/order');
    return data;
  },

  getBySeller: async (): Promise<OrderDto[]> => {
    const { data } = await apiClient.get<OrderDto[]>('/order/seller');
    return data;
  },

  updateStatus: async (id: number, orderStatus: string): Promise<OrderDto> => {
    const { data } = await apiClient.put<OrderDto>(`/order/${id}/status`, { orderStatus });
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/order/${id}`);
  },
};
