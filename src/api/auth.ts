import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';

/* ----------------------------- REQUEST TYPES ----------------------------- */

export interface LoginPayload {
  identifier: string; // students: auid, recruiters/admin: email
  password: string;
}

export interface RecruiterRequestPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  company: string;
  designation?: string;
  company_website?: string;
  industry?: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  location?: string;
  linkedin_url?: string;
  about?: string;
}

export interface UpdateDetailsPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

/* ----------------------------- RESPONSE TYPES ---------------------------- */

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      _id: string;
      auid?: string;
      firstName: string;
      lastName?: string;
      university?: string;
      roles: string[];
      status?: string;
    };
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    _id: string;
    auid?: string;
    firstName: string;
    lastName?: string;
    university?: string;
    roles: string[];
    email?: string;
    phone?: string;
    status?: string;
  };
}

export type UserData = MeResponse['data'];

export interface UpdateDetailsResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    auid: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    university: string;
    roles: string[];
  };
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}

/* ------------------------------- AUTH CLASS ------------------------------ */

class Auth {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: URL,
      withCredentials: true,
      timeout: 15000,
    });
  }

  /* -------------------------------- LOGIN -------------------------------- */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const response = await this.instance.post<LoginResponse>('/api/auth/login', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /* -------------------------------- LOGOUT ------------------------------- */
  logout() {
    return this.instance.post('/api/auth/logout');
  }

  /* ------------------------- RECRUITER SELF-REQUEST ---------------------- */
  async requestRecruiter(data: RecruiterRequestPayload): Promise<{ success: boolean; message: string }> {
    const response = await this.instance.post('/api/auth/recruiter-request', data);
    return response.data;
  }

  /* -------------------------------- GET USER ----------------------------- */
  async getUser(): Promise<UserData> {
    try {
      const response = await this.instance.get<MeResponse>('/api/auth/user');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /* --------------------------- UPDATE USER DETAILS ----------------------- */
  async updateUserDetails(data: UpdateDetailsPayload): Promise<UpdateDetailsResponse> {
    try {
      const response = await this.instance.put<UpdateDetailsResponse>('/api/auth/update', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /* ----------------------------- UPDATE PASSWORD ------------------------- */
  async updatePassword(data: UpdatePasswordPayload): Promise<UpdatePasswordResponse> {
    try {
      const response = await this.instance.put<UpdatePasswordResponse>(
        '/api/auth/update-password',
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const auth = new Auth();
export default auth;
