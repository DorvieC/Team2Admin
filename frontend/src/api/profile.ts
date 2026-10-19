import apiClient from './client';

export interface ProfileDto {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  createdAt: string;
  ordersCount: number;
  bonuses: number;
  level: string;
  levelProgressPercent: number;
  nextLevelHint: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  birthDate?: string;
}

export const profileApi = {
  getMe: async (): Promise<ProfileDto> => {
    const { data } = await apiClient.get<ProfileDto>('/profile/me');
    return data;
  },

  updateMe: async (dto: UpdateProfileDto): Promise<ProfileDto> => {
    const { data } = await apiClient.put<ProfileDto>('/profile/me', dto);
    return data;
  },
};
