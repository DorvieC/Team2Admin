import apiClient from './client';
import { sellersApi } from './sellers';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  RegisterSellerDto,
  User,
} from '../types';

function buildUser(res: AuthResponse): User {
  return {
    name: res.name,
    email: res.email,
    role: res.role,
  };
}

export const authApi = {
  login: async (dto: LoginDto): Promise<{ token: string; user: User }> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', dto);
    return { token: data.token, user: buildUser(data) };
  },

  register: async (dto: RegisterDto): Promise<{ token: string; user: User }> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', dto);
    return { token: data.token, user: buildUser(data) };
  },

  firebaseLogin: async (idToken: string): Promise<{ token: string; user: User }> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/firebase-login', { idToken });
    return { token: data.token, user: buildUser(data) };
  },

  registerSeller: async (
    idToken: string,
    dto: RegisterSellerDto,
  ): Promise<{ token: string; user: User }> => {
    const first = await apiClient.post<AuthResponse>('/auth/firebase-login', { idToken });
    const prevToken = localStorage.getItem('token');
    localStorage.setItem('token', first.data.token);

    try {
      await sellersApi.create({
        name: dto.shopName,
        description: '',
        phone: dto.phone,
        email: first.data.email,
      });
    } catch (err) {
      if (prevToken) localStorage.setItem('token', prevToken); else localStorage.removeItem('token');
      throw err;
    }

    const second = await apiClient.post<AuthResponse>('/auth/firebase-login', { idToken });
    return { token: second.data.token, user: buildUser(second.data) };
  },
};