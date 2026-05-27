import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';

export type RecruiterRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'MoreInfoRequested';
export type RecruiterReviewAction = 'approve' | 'reject' | 'request_info';

export interface CreateRecruiterRequestPayload {
  company_name: string;
  cin_registration_number: string;
  contact_person: string;
  designation: string;
  official_email: string;
  phone: string;
  website?: string;
  company_brief: string;
}

export interface RecruiterAccountRequest extends CreateRecruiterRequestPayload {
  _id: string;
  status: RecruiterRequestStatus;
  decision_note?: string;
  reviewed_by?: any;
  reviewed_at?: string;
  approved_user?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRecruiterRequestPayload {
  action: RecruiterReviewAction;
  decision_note?: string;
}

export interface ReviewRecruiterRequestResult {
  request: RecruiterAccountRequest;
  recruiter_user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName?: string;
    company_name?: string;
    roles: string[];
  };
  login_identifier?: string;
  temporary_password?: string;
}

class RecruitersApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: URL,
      withCredentials: true,
      timeout: 15000,
    });
  }

  async createRequest(payload: CreateRecruiterRequestPayload) {
    const res = await this.instance.post('/api/recruiters/requests', payload);
    return res.data.data as RecruiterAccountRequest;
  }

  async listRequests(status?: RecruiterRequestStatus | '') {
    const res = await this.instance.get('/api/recruiters/requests', {
      params: status ? { status } : undefined,
    });
    return res.data.data as RecruiterAccountRequest[];
  }

  async reviewRequest(requestId: string, payload: ReviewRecruiterRequestPayload) {
    const res = await this.instance.patch(`/api/recruiters/requests/${requestId}`, payload);
    return res.data.data as ReviewRecruiterRequestResult;
  }
}

export const recruitersApi = new RecruitersApi();
export default recruitersApi;
