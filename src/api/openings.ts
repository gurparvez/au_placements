import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';
import type { Skill } from './skills';

export type OpeningType = 'internship' | 'job';
export type WorkMode = 'onsite' | 'remote' | 'hybrid';
export type OpeningStatus = 'open' | 'closed';
export type University = 'Akal University' | 'Eternal University';

export interface Opening {
  _id: string;
  recruiter: string | { _id: string; firstName?: string; lastName?: string };
  company: string;
  title: string;
  description: string;
  type: OpeningType;
  work_mode?: WorkMode;
  location?: string;
  skills: Skill[];
  eligible_universities: University[];
  min_experience?: number;
  stipend_or_salary?: string;
  apply_url?: string;
  apply_by?: string;
  status: OpeningStatus;
  min_cgpa?: number;
  max_backlogs?: number;
  eligible_departments?: string[];
  eligible_batches?: number[];
  allow_placed?: boolean;
  tier?: OpeningTier;
  ctc_lpa?: number;
  rounds?: { name: string; order: number }[];
  application_count?: number;
  has_applied?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Hiring pipeline stages, in order. */
export const APPLICATION_STATUSES = [
  'applied', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'accepted', 'rejected',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const ROUND_RESULTS = ['pending', 'cleared', 'failed', 'absent'] as const;
export type RoundResult = (typeof ROUND_RESULTS)[number];

export interface ApplicantRound {
  name: string;
  order: number;
  result: RoundResult;
  date?: string;
  notes?: string;
}

export interface Applicant {
  _id: string;
  status: ApplicationStatus;
  rounds?: ApplicantRound[];
  current_round?: number;
  appliedAt: string;
  student: { _id: string; firstName?: string; lastName?: string; auid?: string; university?: string } | null;
}

export type OpeningTier = 'regular' | 'core' | 'dream';

export interface OpeningPayload {
  title: string;
  description: string;
  type: OpeningType;
  work_mode?: WorkMode;
  location?: string;
  skills?: string[]; // skill ids
  eligible_universities?: University[];
  min_experience?: number;
  stipend_or_salary?: string;
  apply_url?: string;
  apply_by?: string;
  company?: string;
  min_cgpa?: number;
  max_backlogs?: number;
  eligible_departments?: string[];
  eligible_batches?: number[];
  allow_placed?: boolean;
  tier?: OpeningTier;
  ctc_lpa?: number;
  rounds?: { name: string; order: number }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListOpeningsResponse {
  success: boolean;
  data: Opening[];
  pagination: Pagination;
}

class OpeningsApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({ baseURL: URL, withCredentials: true, timeout: 15000 });
  }

  async list(params?: { page?: number; limit?: number; q?: string; type?: string; university?: string; skill?: string; status?: string; recruiter?: string }): Promise<ListOpeningsResponse> {
    const res = await this.instance.get<ListOpeningsResponse>('/api/openings', { params });
    return res.data;
  }

  async listMine(params?: { page?: number; limit?: number }): Promise<ListOpeningsResponse> {
    const res = await this.instance.get<ListOpeningsResponse>('/api/openings/mine', { params });
    return res.data;
  }

  async get(id: string): Promise<Opening> {
    const res = await this.instance.get<{ success: boolean; data: Opening }>(`/api/openings/${id}`);
    return res.data.data;
  }

  async create(payload: OpeningPayload): Promise<Opening> {
    const res = await this.instance.post<{ success: boolean; data: Opening }>('/api/openings', payload);
    return res.data.data;
  }

  async update(id: string, payload: Partial<OpeningPayload>): Promise<Opening> {
    const res = await this.instance.put<{ success: boolean; data: Opening }>(`/api/openings/${id}`, payload);
    return res.data.data;
  }

  async setStatus(id: string, status: OpeningStatus): Promise<Opening> {
    const res = await this.instance.patch<{ success: boolean; data: Opening }>(`/api/openings/${id}/status`, { status });
    return res.data.data;
  }

  async remove(id: string): Promise<void> {
    await this.instance.delete(`/api/openings/${id}`);
  }

  async apply(id: string): Promise<{ applied: boolean; application_count: number }> {
    const res = await this.instance.post<{ success: boolean; data: { applied: boolean; application_count: number } }>(`/api/openings/${id}/apply`);
    return res.data.data;
  }

  async applicants(id: string): Promise<Applicant[]> {
    const res = await this.instance.get<{ success: boolean; data: Applicant[] }>(`/api/openings/${id}/applicants`);
    return res.data.data;
  }

  /** Record a selection-round outcome. Keeps the flat status in sync server-side. */
  async setRoundResult(
    openingId: string,
    applicationId: string,
    order: number,
    result: RoundResult,
    notes?: string
  ): Promise<{ _id: string; status: ApplicationStatus; current_round: number; rounds: ApplicantRound[] }> {
    const res = await this.instance.patch(
      `/api/openings/${openingId}/applicants/${applicationId}/round`,
      { order, result, notes }
    );
    return res.data.data;
  }

  /** Why can (or can't) the signed-in student apply? */
  async eligibility(openingId: string): Promise<{ eligible: boolean; reasons: { code: string; message: string }[] }> {
    const res = await this.instance.get(`/api/openings/${openingId}/eligibility`);
    return res.data.data;
  }

  /** TPO: cumulative eligibility funnel for this opening. */
  async waterfall(openingId: string): Promise<unknown> {
    const res = await this.instance.get(`/api/openings/${openingId}/waterfall`);
    return res.data.data;
  }

  /** Move an applicant along the hiring pipeline. Notifies the student. */
  async setApplicantStatus(
    openingId: string,
    applicationId: string,
    status: ApplicationStatus
  ): Promise<{ _id: string; status: ApplicationStatus }> {
    const res = await this.instance.patch<{ success: boolean; data: { _id: string; status: ApplicationStatus } }>(
      `/api/openings/${openingId}/applicants/${applicationId}`,
      { status }
    );
    return res.data.data;
  }
}

const openingsApi = new OpeningsApi();
export default openingsApi;
