import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';

/* ----------------------------- TYPES ----------------------------- */

export type University = 'Akal University' | 'Eternal University';
export type Role = 'student' | 'admin';

export interface AdminUser {
  _id: string;
  auid: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  university: University;
  roles: Role[];
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  auid: string;
  password: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  university: University;
  roles?: Role[];
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'auid'>>;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListUsersResponse {
  success: boolean;
  data: AdminUser[];
  pagination: Pagination;
}

/* ----------------------------- ADMIN CLASS ----------------------------- */

class AdminApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: URL,
      withCredentials: true,
      timeout: 15000,
    });
  }

  async listUsers(params?: { page?: number; limit?: number; q?: string }): Promise<ListUsersResponse> {
    const response = await this.instance.get<ListUsersResponse>('/api/admin/users', { params });
    return response.data;
  }

  async getUser(id: string): Promise<AdminUser> {
    const response = await this.instance.get<{ success: boolean; data: AdminUser }>(`/api/admin/users/${id}`);
    return response.data.data;
  }

  async createUser(payload: CreateUserPayload): Promise<AdminUser> {
    const response = await this.instance.post<{ success: boolean; data: AdminUser }>('/api/admin/users', payload);
    return response.data.data;
  }

  async updateUser(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
    const response = await this.instance.put<{ success: boolean; data: AdminUser }>(`/api/admin/users/${id}`, payload);
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.instance.delete(`/api/admin/users/${id}`);
  }
}

const admin = new AdminApi();
export default admin;
