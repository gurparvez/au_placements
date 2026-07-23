import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';
import { createHttp } from './http';

export interface Department {
  _id: string;
  name: string;
  code?: string;
  active: boolean;
}

class DepartmentsApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = createHttp();
  }

  /** Active departments — the dropdown source. Pass all=true (admin) for inactive too. */
  async list(all = false): Promise<Department[]> {
    const res = await this.instance.get('/api/departments', { params: all ? { all: 'true' } : undefined });
    return res.data.data;
  }

  async create(name: string, code?: string): Promise<Department> {
    const res = await this.instance.post('/api/departments', { name, code });
    return res.data.data;
  }

  async update(id: string, data: { name?: string; code?: string; active?: boolean }): Promise<Department> {
    const res = await this.instance.put(`/api/departments/${id}`, data);
    return res.data.data;
  }

  async remove(id: string): Promise<void> {
    await this.instance.delete(`/api/departments/${id}`);
  }
}

export const departmentsApi = new DepartmentsApi();
export default departmentsApi;
