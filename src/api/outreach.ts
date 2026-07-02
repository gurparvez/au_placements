import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';

export interface SendOutreachPayload {
  studentId: string;
  subject: string;
  body: string;
}

class OutreachApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: URL,
      withCredentials: true, // send auth cookie (recruiter-only, gated)
      timeout: 20000,
    });
  }

  async emailStudent(payload: SendOutreachPayload): Promise<{ success: boolean; message: string }> {
    const res = await this.instance.post('/api/outreach', payload);
    return res.data;
  }
}

const outreachApi = new OutreachApi();
export default outreachApi;
