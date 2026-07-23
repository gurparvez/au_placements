import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';
import { createHttp } from './http';

export interface SendOutreachPayload {
  studentId: string;
  subject: string;
  body: string;
}

class OutreachApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = createHttp(20000);
  }

  async emailStudent(payload: SendOutreachPayload): Promise<{ success: boolean; message: string }> {
    const res = await this.instance.post('/api/outreach', payload);
    return res.data;
  }
}

const outreachApi = new OutreachApi();
export default outreachApi;
