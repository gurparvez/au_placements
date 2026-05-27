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
  programme: string;
  branch_department: string;
  batch_year: number;
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

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email?: string;
  auid?: string;
}

export interface ForgotPasswordPayload {
  email?: string;
  auid?: string;
}

export interface ResetPasswordPayload {
  token: string;
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
      programme?: string;
      branch_department?: string;
      batch_year?: number;
      email_verified?: boolean;
      roles: string[];
    };
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    auid: string;
    university: string;
    programme?: string;
    branch_department?: string;
    batch_year?: number;
    email_verified?: boolean;
    email_verification?: {
      token?: string;
      verificationUrl?: string;
    };
    roles: string[];
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
    programme?: string;
    branch_department?: string;
    batch_year?: number;
    email_verified?: boolean;
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
    programme?: string;
    branch_department?: string;
    batch_year?: number;
    email_verified?: boolean;
    roles: string[];
  };
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface LinkPreparedResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    verificationUrl?: string;
    resetUrl?: string;
    alreadyVerified?: boolean;
    sent?: boolean;
  };
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

  async verifyEmail(data: VerifyEmailPayload): Promise<VerifyEmailResponse> {
    const response = await this.instance.post<VerifyEmailResponse>('/api/auth/verify-email', data);
    return response.data;
  }

  async resendVerification(data: ResendVerificationPayload): Promise<LinkPreparedResponse> {
    const response = await this.instance.post<LinkPreparedResponse>(
      '/api/auth/resend-verification',
      data
    );
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordPayload): Promise<LinkPreparedResponse> {
    const response = await this.instance.post<LinkPreparedResponse>('/api/auth/forgot-password', data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordPayload): Promise<VerifyEmailResponse> {
    const response = await this.instance.post<VerifyEmailResponse>('/api/auth/reset-password', data);
    return response.data;
  }
}

const auth = new Auth();
export default auth;
