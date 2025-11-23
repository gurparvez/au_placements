// src/store/student/studentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
  async () => {
    return await studentApi.getStudentProfile();
  }
);

export const createStudentProfile = createAsyncThunk<
  { success: boolean; profile: StudentProfileResponse },
  CreateStudentProfilePayload
>('student/createProfile', async (payload) => {
  return await studentApi.createStudentProfile(payload);
});

export const updateStudentProfile = createAsyncThunk<
  StudentProfileResponse,
  UpdateStudentProfilePayload
>('student/updateProfile', async (payload) => {
  return await studentApi.updateStudentProfile(payload);
});

export const fetchAnyStudentProfile = createAsyncThunk<
  { user: any; profile: StudentProfileResponse }, // return BOTH
  GetAnyStudentProfileRequest
>('student/fetchAnyProfile', async (payload) => {
  return await studentApi.getAnyStudentProfile(payload);
});

export const fetchAllStudents = createAsyncThunk('student/fetchAll', async () => {
  return await studentApi.getAllStudents();
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
      state.error = action.error?.message || 'Something went wrong';
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

    // PUBLIC PROFILE
    builder
      .addCase(fetchAnyStudentProfile.pending, pending)
      .addCase(fetchAnyStudentProfile.rejected, rejected)
      .addCase(fetchAnyStudentProfile.fulfilled, (state, action) => {
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
