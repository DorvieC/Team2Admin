import apiClient from './client';

export interface Seller {
  id: number;
  name?: string;
  description?: string;
  userId: number;
  createdAt: string;
}

export interface SellerDetail extends Seller {
  phone?: string;
  email?: string;
}

export interface CreateSellerDto {
  name: string;
  description: string;
  phone: string;
  email: string;
}

export const sellersApi = {
  getAll: async (): Promise<Seller[]> => {
    const { data } = await apiClient.get<Seller[]>('/seller');
    return data;
  },

  getById: async (id: number): Promise<Seller> => {
    const { data } = await apiClient.get<Seller>(`/seller/${id}`);
    return data;
  },

  getDetails: async (id: number): Promise<SellerDetail> => {
    const { data } = await apiClient.get<SellerDetail>(`/seller/${id}/details`);
    return data;
  },

  create: async (dto: CreateSellerDto): Promise<SellerDetail> => {
    const { data } = await apiClient.post<SellerDetail>('/seller', dto);
    return data;
  },

  update: async (id: number, dto: CreateSellerDto): Promise<SellerDetail> => {
    const { data } = await apiClient.put<SellerDetail>(`/seller/${id}`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/seller/${id}`);
  },

  getMine: async (email: string): Promise<SellerDetail | null> => {
    const all = await apiClient.get<Seller[]>('/seller');
    const details = await Promise.all(
      all.data.map((s) =>
        apiClient.get<SellerDetail>(`/seller/${s.id}/details`).then((r) => r.data).catch(() => null),
      ),
    );
    return details.find((d) => d && d.email === email) ?? null;
  },
};
