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
    });
  }

  /* ------------------------------ Create Profile ----------------------------- */
  async createStudentProfile(
    data: CreateStudentProfilePayload
  ): Promise<{ success: boolean; profile: StudentProfileResponse }> {
    const form = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      // 1. SKIP undefined or null values entirely
      if (value === undefined || value === null) return;

      // 2. Handle Profile Image separately (skip here, add later)
      if (key === 'profile_image') return;

      // 3. Stringify Arrays/Objects (like education, skills, looking_for)
      if (Array.isArray(value) || typeof value === 'object') {
        form.append(key, JSON.stringify(value));
      } else {
        // 4. Append primitives (strings/numbers)
        // Because we checked for undefined/null above, this is safe now.
        form.append(key, value as any);
      }
    });

    // Append image if it exists
    if (data.profile_image) {
      form.append('profile_image', data.profile_image);
    }

    try {
      console.log(form)
      const res = await this.instance.post('/api/student', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error: any) {
      // Optional: Log the specific backend error message to console for debugging
      console.error('Backend Error Details:', error.response?.data);
      throw error;
    }
  }

  /* ------------------------------ Update Profile ----------------------------- */
  async updateStudentProfile(
    payload: UpdateStudentProfilePayload
  ): Promise<StudentProfileResponse> {
    const form = new FormData();

    // Convert ALL fields in payload to FormData dynamically
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

    return res.data;
  }

  /* ----------------------------- Get Logged Profile ---------------------------- */
  async getStudentProfile(): Promise<StudentProfileResponse> {
    const res = await this.instance.get('/api/student');
    return res.data;
  }

  /* ----------------------------- Get All Students ------------------------------ */
  async getAllStudents(): Promise<{
    success: boolean;
    students: StudentProfileResponse[];
  }> {
    const res = await this.instance.get('/api/student/all');
    return res.data;
  }

  /* ----------------------------- Get Any Student's profile ------------------------------ */
  async getAnyStudentProfile(
    req: GetAnyStudentProfileRequest
  ): Promise<GetAnyStudentProfileResponse> {
    const res = await this.instance.get('/api/student/profile', {
      params: { userId: req.userId },
    });

    return res.data;
  }
}

/* -------------------------------------------------------------------------- */

export const studentApi = new StudentApi();
export default studentApi;
