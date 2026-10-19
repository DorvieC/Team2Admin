import apiClient from './client';
import type { Product } from '../types';

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  brandId: number;
  categoryId: number;
  imgUrls?: string[];
}

export interface UpdateProductDto extends CreateProductDto {
  isActive: boolean;
}

export interface ProductSearchResult {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchParams {
  q?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sellerId?: number;
}

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<Product[]>('/product');
    return data;
  },

  getById: async (id: number): Promise<Product> => {
    const { data } = await apiClient.get<Product>(`/product/${id}`);
    return data;
  },

  search: async (params: SearchParams): Promise<ProductSearchResult> => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.categoryId) query.set('categoryId', String(params.categoryId));
    if (params.minPrice != null) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice != null) query.set('maxPrice', String(params.maxPrice));
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.sellerId) query.set('sellerId', String(params.sellerId));
    const { data } = await apiClient.get<ProductSearchResult>(`/product/search?${query}`);
    return data;
  },

  create: async (dto: CreateProductDto): Promise<Product> => {
    const { data } = await apiClient.post<Product>('/product', dto);
    return data;
  },

  update: async (id: number, dto: UpdateProductDto): Promise<Product> => {
    const { data } = await apiClient.put<Product>(`/product/${id}`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/product/${id}`);
  },
};
