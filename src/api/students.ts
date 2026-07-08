// src/api/student.ts
import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';
import {
  type CreateStudentProfilePayload,
  type UpdateStudentProfilePayload,
  type StudentProfileResponse,
  type GetAnyStudentProfileRequest,
  type GetAnyStudentProfileResponse,
} from './students.types';

export interface UserSearchResult {
  _id: string;
  firstName: string;
  lastName?: string;
  auid?: string;
  university?: string;
  roles?: string[];
}

export interface BrowseParams {
  q?: string;
  skills?: string;        // comma-separated display names
  university?: string;
  opportunity?: string;   // 'internship' | 'job'
  field?: string;
  exp?: string;           // '0-6' | '6-12' | '12-24' | '24+'
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface BrowsePagination { page: number; limit: number; total: number; totalPages: number; }

class StudentApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: URL,
      withCredentials: true, // cookie-based auth
      timeout: 15000,
    });
  }

  /* ------------------------------ Create Profile ----------------------------- */
  async createStudentProfile(
    data: CreateStudentProfilePayload
  ): Promise<{ success: boolean; profile: StudentProfileResponse }> {
    const form = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'profile_image') return;

      if (Array.isArray(value) || typeof value === 'object') {
        form.append(key, JSON.stringify(value));
      } else {
        form.append(key, value as any);
      }
    });

    if (data.profile_image) {
      form.append('profile_image', data.profile_image);
    }

    const res = await this.instance.post('/api/student', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Backend returns { success, message, data: profile }
    return { success: res.data.success, profile: res.data.data };
  }

  /* ------------------------------ Update Profile ----------------------------- */
  async updateStudentProfile(
    payload: UpdateStudentProfilePayload
  ): Promise<StudentProfileResponse> {
    const form = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value instanceof File) {
        form.append(key, value);
      } else if (typeof value === 'object') {
        form.append(key, JSON.stringify(value));
      } else {
        form.append(key, value as any);
      }
    });

    const res = await this.instance.put('/api/student', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Backend returns { success, message, data: profile }
    return res.data.data;
  }

  /* ----------------------------- Get Logged Profile ---------------------------- */
  async getStudentProfile(): Promise<StudentProfileResponse> {
    const res = await this.instance.get('/api/student');
    return res.data.data;
  }

  /* ----------------------------- Get All Students ------------------------------ */
  async getAllStudents(): Promise<{
    success: boolean;
    students: StudentProfileResponse[];
  }> {
    const res = await this.instance.get('/api/student/all');
    // Backend returns { success, data: [...], pagination }
    return { success: res.data.success, students: res.data.data };
  }

  /* -------------------- Browse (server-side filter + paginate) ------------------ */
  async browse(params: BrowseParams): Promise<{ students: any[]; pagination: BrowsePagination }> {
    const res = await this.instance.get('/api/student/browse', { params });
    return { students: res.data.data, pagination: res.data.pagination };
  }

  async filterMeta(): Promise<{ fields: string[] }> {
    const res = await this.instance.get('/api/student/filters');
    return res.data.data;
  }

  /* ----------------------------- Search students by name or AUID ------------------------------ */
  async searchStudents(q: string): Promise<UserSearchResult[]> {
    const res = await this.instance.get('/api/student/search', { params: { q } });
    return res.data.data ?? [];
  }

  /* ----------------------------- Get Any Student's profile ------------------------------ */
  async getAnyStudentProfile(
    req: GetAnyStudentProfileRequest
  ): Promise<GetAnyStudentProfileResponse> {
    const res = await this.instance.get('/api/student/profile', {
      params: { userId: req.userId },
    });
    // Backend returns { success, data: { user, profile } }
    return res.data.data;
  }
}

/* -------------------------------------------------------------------------- */

export const studentApi = new StudentApi();
export default studentApi;
