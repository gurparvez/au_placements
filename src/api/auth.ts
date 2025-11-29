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
  university: 'Akal University' | 'Eternal University';
  id_card: File;
}

export interface UpdateDetailsPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

/* ----------------------------- RESPONSE TYPES ---------------------------- */

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    _id: string;
    auid: string;
    firstName: string;
    lastName?: string;
    university: string;
    roles: string[];
  };
}

export interface RegisterResponse {
  message: string;
  verified: boolean;
  user: {
    _id: string;
    auid: string;
    university: string;
    roles: string[];
  };
}

export interface MeResponse {
  _id: string;
  auid: string;
  firstName: string;
  lastName?: string;
  university: string;
  roles: string[];
  email?: string;
  phone?: string;
}

export interface UpdateDetailsResponse {
  success: boolean;
  message: string;
  user: {
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
    });
  }

  /* ------------------------------- REGISTER ------------------------------- */
  async register(data: RegisterPayload): Promise<RegisterResponse> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      // Append all fields
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
  async getUser(): Promise<MeResponse> {
    try {
      const response = await this.instance.get('/api/auth/user');
      return response.data.user;
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
