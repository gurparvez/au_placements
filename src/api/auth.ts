import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';

/* ----------------------------- REQUEST TYPES ----------------------------- */

export interface LoginPayload {
  auid: string;
  password: string;
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
      auid: string;
      firstName: string;
      lastName?: string;
      university: string;
      roles: string[];
    };
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    _id: string;
    auid: string;
    firstName: string;
    lastName?: string;
    university: string;
    roles: string[];
    email?: string;
    phone?: string;
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
