import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';
import { createHttp } from './http';

export interface RecruiterProfile {
  _id: string;
  user: string;
  company: string;
  company_website?: string;
  company_logo?: string;
  industry?: string;
  company_size?: string;
  designation?: string;
  work_email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  about?: string;
}

export interface UpdateRecruiterPayload {
  company?: string;
  designation?: string;
  company_website?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  linkedin_url?: string;
  about?: string;
  work_email?: string;
  logo?: File | null;
}

class RecruiterApi {
  private instance: AxiosInstance;
  constructor() { this.instance = createHttp(20000); }

  async getMe(): Promise<{ user: any; profile: RecruiterProfile }> {
    const res = await this.instance.get('/api/recruiter/me');
    return res.data.data;
  }

  async updateMe(payload: UpdateRecruiterPayload): Promise<RecruiterProfile> {
    const { logo, ...fields } = payload;
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });
    if (logo) fd.append('company_logo', logo);
    const res = await this.instance.put('/api/recruiter/me', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  }
}

const recruiterApi = new RecruiterApi();
export default recruiterApi;
