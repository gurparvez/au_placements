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
      if (key === 'supporting_documents') return;

      if (value instanceof File) {
        form.append(key, value);
      } else if (Array.isArray(value) || typeof value === 'object') {
        form.append(key, JSON.stringify(value));
      } else {
        form.append(key, value as any);
      }
    });

    if (data.profile_image) {
      form.append('profile_image', data.profile_image);
    }

    data.supporting_documents?.forEach((file) => {
      form.append('supporting_documents', file);
    });

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
      if (value === undefined || value === null) return;
      if (key === 'supporting_documents') return;

      if (value instanceof File) {
        form.append(key, value);
      } else if (typeof value === 'object') {
        form.append(key, JSON.stringify(value));
      } else {
        form.append(key, value as any);
      }
    });

    payload.supporting_documents?.forEach((file) => {
      form.append('supporting_documents', file);
    });

    const res = await this.instance.put('/api/student', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Backend returns { success, message, data: profile }
    return res.data.data;
  }

  async markProfileReviewed(): Promise<StudentProfileResponse> {
    const res = await this.instance.post('/api/student/review');
    return res.data.data;
  }

  async getProfileHistory(): Promise<any[]> {
    const res = await this.instance.get('/api/student/history');
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
