import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '@/api/auth';
import axios from 'axios';

import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  MeResponse,
  UpdateDetailsPayload,
  UpdateDetailsResponse,
  UpdatePasswordPayload,
  UpdatePasswordResponse,
} from '@/api/auth';

/* ---------------------------- ASYNC THUNKS ---------------------------- */

// 2. Updated Thunks to use rejectWithValue
export const loginUser = createAsyncThunk<LoginResponse, LoginPayload>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.login(payload);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk<RegisterResponse, RegisterPayload>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.register(payload);
    } catch (err: any) {
      // This specifically catches your 400 error message from the backend
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<MeResponse>(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.getUser();
    } catch (err: any) {
      // Often for "Me" call we don't want to show an error if just not logged in
      return rejectWithValue(null);
    }
  }
);

export const logoutUser = createAsyncThunk<void, void>('auth/logout', async () => {
  await authApi.logout();
});

export const updateUserDetails = createAsyncThunk<UpdateDetailsResponse, UpdateDetailsPayload>(
  'auth/updateUserDetails',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.updateUserDetails(payload);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message || 'Update failed');
    }
  }
);

export const updateUserPassword = createAsyncThunk<UpdatePasswordResponse, UpdatePasswordPayload>(
  'auth/updatePassword',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.updatePassword(payload);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message || 'Password update failed');
    }
  }
);

/* ------------------------------- SLICE ------------------------------- */

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    initialized: false,
  } as {
    user: MeResponse | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;
  },

  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.initialized = false;
    },
    // Optional: Action to clear error manually (e.g., when switching forms)
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    const pending = (state: any) => {
      state.loading = true;
      state.error = null;
    };

    // 3. Updated Rejected Handler
    const rejected = (state: any, action: any) => {
      state.loading = false;

      // If we used rejectWithValue, the error string is in action.payload
      if (action.payload) {
        state.error = action.payload as string;
      } else {
        // Fallback for unexpected errors
        state.error = action.error?.message || 'Something went wrong';
      }

      state.initialized = true;
    };

    // --- LOGIN ---
    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.rejected, rejected)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.initialized = true;
      });

    // --- REGISTER ---
    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.rejected, rejected)
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.initialized = true;
      });

    // --- FETCH CURRENT USER ---
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        // Silent failure for checkAuth usually
        state.loading = false;
        state.user = null;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      });

    // --- LOGOUT ---
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    });

    // --- UPDATE DETAILS ---
    builder
      .addCase(updateUserDetails.pending, pending)
      .addCase(updateUserDetails.rejected, rejected)
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      });

    // --- UPDATE PASSWORD ---
    builder
      .addCase(updateUserPassword.pending, pending)
      .addCase(updateUserPassword.rejected, rejected)
      .addCase(updateUserPassword.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
