import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '@/api/auth'; // ✔ use shared instance

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

// New Thunk: Update User Details
export const updateUserDetails = createAsyncThunk<UpdateDetailsResponse, UpdateDetailsPayload>(
  'auth/updateUserDetails',
  async (payload) => {
    return await authApi.updateUserDetails(payload);
  }
);

// New Thunk: Update Password
export const updateUserPassword = createAsyncThunk<UpdatePasswordResponse, UpdatePasswordPayload>(
  'auth/updatePassword',
  async (payload) => {
    return await authApi.updatePassword(payload);
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
  },

  extraReducers: (builder) => {
    const pending = (state: any) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state: any, action: any) => {
      state.loading = false;
      state.error = action.error?.message || 'Something went wrong';
      // We don't necessarily set initialized=true on all failures, but keeping consistency with your logic:
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
        // Note: We often don't want global loading=true for background checks, but keeping consistent:
        // state.loading = true; 
      })
      .addCase(fetchCurrentUser.rejected, rejected)
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
        // Update the local user state with the fresh data returned from the API
        state.user = action.payload.user;
      });

    // --- UPDATE PASSWORD ---
    builder
      .addCase(updateUserPassword.pending, pending)
      .addCase(updateUserPassword.rejected, rejected)
      .addCase(updateUserPassword.fulfilled, (state) => {
        state.loading = false;
        // Password update usually doesn't return user data, just success
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;