import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';
import { createHttp } from './http';

/* ----------------------------- TYPES ----------------------------- */

export type University = 'Akal University' | 'Eternal University';
export type Role = 'student' | 'recruiter' | 'admin';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'rejected';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export interface AdminUser {
  _id: string;
  auid?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  university?: University;
  gender?: 'male' | 'female' | 'other';
  roles: Role[];
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruiterProfile {
  _id: string;
  user: string;
  company: string;
  designation?: string;
  company_website?: string;
  industry?: string;
  company_size?: CompanySize;
  location?: string;
  linkedin_url?: string;
  about?: string;
  rejection_reason?: string;
}

export interface RecruiterRow {
  user: AdminUser;
  recruiter: RecruiterProfile | null;
}

export interface ListRecruitersResponse {
  success: boolean;
  data: RecruiterRow[];
  pagination: Pagination;
}

export interface AdminCreateRecruiterPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  company: string;
  designation?: string;
  company_website?: string;
  industry?: string;
  company_size?: CompanySize;
  location?: string;
  linkedin_url?: string;
  about?: string;
}

export interface CreateUserPayload {
  auid: string;
  password: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  university: University;
  gender?: 'male' | 'female' | 'other';
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
    this.instance = createHttp();
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

  /* ------------------------------ recruiters ------------------------------ */

  async listRecruiters(params?: { page?: number; limit?: number; q?: string; status?: string }): Promise<ListRecruitersResponse> {
    const response = await this.instance.get<ListRecruitersResponse>('/api/admin/recruiters', { params });
    return response.data;
  }

  async createRecruiter(payload: AdminCreateRecruiterPayload): Promise<RecruiterRow> {
    const response = await this.instance.post<{ success: boolean; data: RecruiterRow }>('/api/admin/recruiters', payload);
    return response.data.data;
  }

  async approveRecruiter(recruiterId: string): Promise<RecruiterRow> {
    const response = await this.instance.patch<{ success: boolean; data: RecruiterRow }>(`/api/admin/recruiters/${recruiterId}/approve`);
    return response.data.data;
  }

  async rejectRecruiter(recruiterId: string, reason?: string): Promise<RecruiterRow> {
    const response = await this.instance.patch<{ success: boolean; data: RecruiterRow }>(`/api/admin/recruiters/${recruiterId}/reject`, { reason });
    return response.data.data;
  }
}

const admin = new AdminApi();
export default admin;
