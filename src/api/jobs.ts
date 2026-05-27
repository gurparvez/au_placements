import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';

export type JobType = 'FullTime' | 'Internship' | 'Project' | 'Campus';
export type JobStatus = 'Draft' | 'Active' | 'Closed';

export interface EligibilityCriteria {
  min_cgpa?: number;
  allowed_branches?: string[];
  allowed_programmes?: string[];
  allowed_batch_years?: number[];
  allowed_universities?: ('Akal University' | 'Eternal University')[];
  no_active_backlogs?: boolean;
  max_backlogs?: number;
}

export interface JobListing {
  _id: string;
  company_name: string;
  title: string;
  role: string;
  description: string;
  type: JobType;
  target_university: 'Akal University' | 'Eternal University' | 'Both';
  ctc_stipend?: string;
  location?: string;
  eligibility: EligibilityCriteria;
  deadline: string;
  status: JobStatus;
  contact_person?: string;
  my_eligibility?: {
    eligible: boolean;
    reasons: string[];
  };
  my_application?: {
    _id: string;
    current_status: string;
    applied_at: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationResponse {
  _id: string;
  listing: JobListing;
  current_status: string;
  applied_at: string;
}

class JobsApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: URL,
      withCredentials: true,
      timeout: 15000,
    });
  }

  async getJobs(params?: { type?: string; company?: string; target_university?: string }) {
    const res = await this.instance.get('/api/jobs', { params });
    return res.data.data as JobListing[];
  }

  async getJob(jobId: string) {
    const res = await this.instance.get(`/api/jobs/${jobId}`);
    return res.data.data as JobListing;
  }

  async apply(jobId: string) {
    const res = await this.instance.post(`/api/jobs/${jobId}/apply`);
    return res.data.data;
  }

  async getMyApplications() {
    const res = await this.instance.get('/api/jobs/applications/me');
    return res.data.data as ApplicationResponse[];
  }
}

export const jobsApi = new JobsApi();
export default jobsApi;
