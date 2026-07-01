// src/api/courses.ts
import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants'; // Ensure this points to your backend URL

export interface Course {
  _id: string;
  name: string;
  category: string; // 'ug' | 'pg' etc
  __v?: number;
}

export interface GetCourseByIdResponse {
  success: boolean;
  course: Course;
}

export class CoursesApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: URL,
      withCredentials: true, // send the auth cookie for protected routes (POST /courses)
      timeout: 15000,
    });
  }

  // GET /api/courses/search?q={query}
  async searchCourses(query: string): Promise<Course[]> {
    const { data } = await this.instance.get(`/api/courses/search?q=${query}`);
    // Backend returns { success, data: [...] }
    return Array.isArray(data.data) ? data.data : [];
  }

  // POST /api/courses
  async createCourse(name: string, category: string): Promise<Course> {
    const { data } = await this.instance.post(`/api/courses`, { name, category });
    return data.data;
  }

  async getCourseById(id: string): Promise<GetCourseByIdResponse> {
    const { data } = await this.instance.get(`/api/courses/${id}`);
    // Backend returns { success, data: course }
    return { success: data.success, course: data.data };
  }
}

export const coursesApi = new CoursesApi();
export default coursesApi;
