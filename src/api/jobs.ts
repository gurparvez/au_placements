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

export interface CreateJobPayload {
  company_name: string;
  title: string;
  role: string;
  description: string;
  type: JobType;
  target_university: 'Akal University' | 'Eternal University' | 'Both';
  ctc_stipend?: string;
  location?: string;
  deadline: string;
  contact_person?: string;
  status?: JobStatus;
  eligibility?: EligibilityCriteria;
}

export interface JobListing {
  _id: string;
  posted_by?: string;
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
    overridden?: boolean;
    override_reason?: string;
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
  listing: JobListing | string;
  user?: any;
  student?: any;
  current_status: string;
  applied_at: string;
  status_history?: {
    status: string;
    note?: string;
    updated_at: string;
  }[];
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

  async createJob(payload: CreateJobPayload) {
    const res = await this.instance.post('/api/jobs', payload);
    return res.data.data as JobListing;
  }

  async updateJob(jobId: string, payload: Partial<CreateJobPayload>) {
    const res = await this.instance.patch(`/api/jobs/${jobId}`, payload);
    return res.data.data as JobListing;
  }

  async getApplicants(jobId: string) {
    const res = await this.instance.get(`/api/jobs/${jobId}/applications`);
    return res.data.data as ApplicationResponse[];
  }

  async updateApplicationStatus(jobId: string, applicationId: string, status: string, note?: string) {
    const res = await this.instance.patch(`/api/jobs/${jobId}/applications/${applicationId}`, {
      status,
      note,
    });
    return res.data.data as ApplicationResponse;
  }

  async overrideEligibility(jobId: string, userId: string, eligible: boolean, reason: string) {
    const res = await this.instance.post(`/api/jobs/${jobId}/eligibility-overrides`, {
      userId,
      eligible,
      reason,
    });
    return res.data.data as JobListing;
  }
}

export const jobsApi = new JobsApi();
export default jobsApi;
