import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jobsApi, { type ApplicationResponse, type JobListing } from '@/api/jobs';

export const fetchJobs = createAsyncThunk<
  JobListing[],
  { type?: string; company?: string; target_university?: string } | undefined
>('jobs/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await jobsApi.getJobs(params);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue(err.message || 'Failed to fetch jobs');
  }
});

export const applyToJob = createAsyncThunk<any, string>(
  'jobs/apply',
  async (jobId, { rejectWithValue }) => {
    try {
      return await jobsApi.apply(jobId);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message || 'Failed to apply');
    }
  }
);

export const fetchMyApplications = createAsyncThunk<ApplicationResponse[]>(
  'jobs/fetchMyApplications',
  async (_, { rejectWithValue }) => {
    try {
      return await jobsApi.getMyApplications();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message || 'Failed to fetch applications');
    }
  }
);

interface JobState {
  jobs: JobListing[];
  applications: ApplicationResponse[];
  loading: boolean;
  applyingJobId: string | null;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  applications: [],
  loading: false,
  applyingJobId: null,
  error: null,
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearJobError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch jobs';
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      });

    builder
      .addCase(applyToJob.pending, (state, action) => {
        state.applyingJobId = action.meta.arg;
        state.error = null;
      })
      .addCase(applyToJob.rejected, (state, action: any) => {
        state.applyingJobId = null;
        state.error = action.payload || action.error?.message || 'Failed to apply';
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.applyingJobId = null;
        const jobId = action.payload?.listing;
        state.jobs = state.jobs.map((job) =>
          job._id === jobId
            ? {
                ...job,
                my_application: {
                  _id: action.payload._id,
                  current_status: action.payload.current_status,
                  applied_at: action.payload.applied_at,
                },
              }
            : job
        );
      });

    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchMyApplications.rejected, (state, action: any) => {
        state.error = action.payload || action.error?.message || 'Failed to fetch applications';
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.applications = action.payload;
      });
  },
});

export const { clearJobError } = jobSlice.actions;
export default jobSlice.reducer;
