import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';
import { createHttp } from './http';

export interface Company {
  companyUserId: string;
  company: string;
  industry?: string;
  location?: string;
  logo?: string;
  followers?: number;
  is_following: boolean;
}

export interface CompanyProfile extends Company {
  website?: string;
  company_size?: string;
  designation?: string;
  linkedin_url?: string;
  about?: string;
  contact?: string;
}

export interface Pagination { page: number; limit: number; total: number; totalPages: number; }
export interface CompaniesResponse { success: boolean; data: Company[]; pagination: Pagination; }

class CompaniesApi {
  private instance: AxiosInstance;
  constructor() { this.instance = createHttp(); }

  async list(params?: { page?: number; limit?: number; q?: string }): Promise<CompaniesResponse> {
    const res = await this.instance.get<CompaniesResponse>('/api/companies', { params });
    return res.data;
  }
  async get(companyUserId: string): Promise<CompanyProfile> {
    const res = await this.instance.get(`/api/companies/${companyUserId}`);
    return res.data.data;
  }
  async following(): Promise<Company[]> {
    const res = await this.instance.get('/api/companies/following');
    return res.data.data;
  }
  async follow(companyUserId: string): Promise<{ following: boolean; followers: number }> {
    const res = await this.instance.post(`/api/companies/${companyUserId}/follow`);
    return res.data.data;
  }
  async unfollow(companyUserId: string): Promise<{ following: boolean; followers: number }> {
    const res = await this.instance.delete(`/api/companies/${companyUserId}/follow`);
    return res.data.data;
  }
}

const companiesApi = new CompaniesApi();
export default companiesApi;
