// src/api/courses.ts
import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants'; // Ensure this points to your backend URL

export interface Course {
  _id: string;
  name: string;
  category: string; // 'ug' | 'pg' etc
  __v?: number;
}

export class CoursesApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: URL,
    });
  }

  // GET /api/courses/search?q={query}
  async searchCourses(query: string): Promise<Course[]> {
    const { data } = await this.instance.get(`/api/courses/search?q=${query}`);
    return Array.isArray(data) ? data : [];
  }

  // POST /api/courses
  async createCourse(name: string, category: string): Promise<Course> {
    const { data } = await this.instance.post(`/api/courses`, { name, category });
    return data;
  }
}

export const coursesApi = new CoursesApi();
export default coursesApi;