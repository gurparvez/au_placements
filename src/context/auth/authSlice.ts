import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '@/api/auth'; // ✔ use shared instance

import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  MeResponse,
} from '@/api/auth';

export const loginUser = createAsyncThunk<LoginResponse, LoginPayload>(
  'auth/login',
  async (payload) => {
    return await authApi.login(payload); // ✔ using shared instance
  }
);

export const registerUser = createAsyncThunk<RegisterResponse, RegisterPayload>(
  'auth/register',
  async (payload) => {
    return await authApi.register(payload);
  }
);

export const fetchCurrentUser = createAsyncThunk<MeResponse>('auth/me', async () => {
  return await authApi.getUser();
});

export const logoutUser = createAsyncThunk<void, void>('auth/logout', async () => {
  await authApi.logout(); // no return
});

// ------------------------------ slice stays same ------------------------------
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
  },

  extraReducers: (builder) => {
    const pending = (state: any) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state: any, action: any) => {
      state.loading = false;
      state.error = action.error?.message || 'Something went wrong';
      state.initialized = true;
    };

    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.rejected, rejected)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.initialized = true;
      });

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.rejected, rejected)
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.initialized = true;
      });

    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, rejected)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      });

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
