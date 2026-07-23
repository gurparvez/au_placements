// src/store/student/studentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { studentApi } from '@/api/students'; // adjust path
import {
  type CreateStudentProfilePayload,
  type UpdateStudentProfilePayload,
  type StudentProfileResponse,
  type GetAnyStudentProfileRequest,
  type GetAnyStudentProfileResponse,
} from '@/api/students.types';

// -------------------------------
// Async thunks
// -------------------------------

// Get authenticated user's profile
export const fetchStudentProfile = createAsyncThunk<StudentProfileResponse>(
  'student/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await studentApi.getStudentProfile();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message || 'Failed to fetch profile');
    }
  }
);

export const createStudentProfile = createAsyncThunk<
  { success: boolean; profile: StudentProfileResponse },
  CreateStudentProfilePayload
>('student/createProfile', async (payload, { rejectWithValue }) => {
  try {
    return await studentApi.createStudentProfile(payload);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue(err.message || 'Failed to create profile');
  }
});

export const updateStudentProfile = createAsyncThunk<
  StudentProfileResponse,
  UpdateStudentProfilePayload
>('student/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    return await studentApi.updateStudentProfile(payload);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue(err.message || 'Failed to update profile');
  }
});

export const fetchAnyStudentProfile = createAsyncThunk<
  { user: any; profile: StudentProfileResponse }, // return BOTH
  GetAnyStudentProfileRequest
>('student/fetchAnyProfile', async (payload, { rejectWithValue }) => {
  try {
    return await studentApi.getAnyStudentProfile(payload);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue(err.message || 'Failed to fetch student profile');
  }
});

export const fetchAllStudents = createAsyncThunk('student/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await studentApi.getAllStudents();
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue(err.message || 'Failed to fetch students');
  }
});

// -------------------------------
// Slice State
// -------------------------------
interface StudentState {
  profile: StudentProfileResponse | null;
  publicProfile: StudentProfileResponse | null; // from getAnyStudentProfile
  allStudents: any[] | null;

  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  profile: null,
  publicProfile: null,
  allStudents: null,
  loading: false,
  error: null,
};

// -------------------------------
// Slice
// -------------------------------
const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    clearStudentState: (state) => {
      state.profile = null;
      state.publicProfile = null;
      state.allStudents = null;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // UNIVERSAL HANDLER FOR ALL FETCH STATES
    const pending = (state: StudentState) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state: StudentState, action: any) => {
      state.loading = false;
      // If we used rejectWithValue, the error string is in action.payload
      if (action.payload) {
        state.error = action.payload as string;
      } else {
        state.error = action.error?.message || 'Something went wrong';
      }
    };

    // FETCH SELF PROFILE
    builder
      .addCase(fetchStudentProfile.pending, pending)
      .addCase(fetchStudentProfile.rejected, rejected)
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      });

    // CREATE PROFILE
    builder
      .addCase(createStudentProfile.pending, pending)
      .addCase(createStudentProfile.rejected, rejected)
      .addCase(createStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
      });

    // UPDATE PROFILE
    builder
      .addCase(updateStudentProfile.pending, pending)
      .addCase(updateStudentProfile.rejected, rejected)
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      });

    // PUBLIC PROFILE — only the latest request may settle into state, so rapid
    // profile-to-profile navigation never shows the slower, older response.
    builder
      .addCase(fetchAnyStudentProfile.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        (state as any).publicProfileRequestId = action.meta.requestId;
      })
      .addCase(fetchAnyStudentProfile.rejected, (state, action) => {
        if ((state as any).publicProfileRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = (action.payload as string) || action.error?.message || 'Something went wrong';
      })
      .addCase(fetchAnyStudentProfile.fulfilled, (state, action) => {
        if ((state as any).publicProfileRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.publicProfile = {
          ...action.payload.profile,
          user: action.payload.user, // inject full user
        };
      });

    // ALL STUDENTS
    builder
      .addCase(fetchAllStudents.pending, pending)
      .addCase(fetchAllStudents.rejected, rejected)
      .addCase(fetchAllStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.allStudents = action.payload.students;
      });
  },
});

export const { clearStudentState } = studentSlice.actions;

export default studentSlice.reducer;
