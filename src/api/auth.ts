import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';

/* ----------------------------- REQUEST TYPES ----------------------------- */

export interface LoginPayload {
  auid: string;
  password: string;
}

export interface RegisterPayload {
  auid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  idCard: File;
}

/* ----------------------------- RESPONSE TYPES ---------------------------- */

export interface LoginResponse {
  message: string;
  token: string; // Still part of response, but we DO NOT store it
  user: {
    _id: string;
    auid: string;
    firstName: string;
    roles: string[];
  };
}

export interface RegisterResponse {
  message: string;
  verified: boolean;
  user: {
    _id: string;
    auid: string;
    roles: string[];
  };
}

export interface MeResponse {
  _id: string;
  auid: string;
  firstName: string;
  roles: string[];
}

/* ------------------------------- AUTH CLASS ------------------------------ */

class Auth {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: URL,
      withCredentials: true, // 🔥 VERY IMPORTANT for cookie-based auth
    });
  }

  /* ------------------------------- REGISTER ------------------------------- */
  async register(data: RegisterPayload): Promise<RegisterResponse> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as any);
    });

    try {
      const response = await this.instance.post<RegisterResponse>('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /* -------------------------------- LOGIN -------------------------------- */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const response = await this.instance.post<LoginResponse>('/api/auth/login', payload);

      // 🔥 Do NOT store token — backend sets cookie
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /* -------------------------------- LOGOUT ------------------------------- */
  logout() {
    // Optional: Call backend logout to clear cookie
    return this.instance.post('/api/auth/logout');
  }

  /* -------------------------------- GET USER ----------------------------- */
  async getUser(): Promise<MeResponse> {
    try {
      const response = await this.instance.get<MeResponse>('/api/auth/user');

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const auth = new Auth();
export default auth;
