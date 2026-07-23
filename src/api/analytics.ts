import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';
import { createHttp } from './http';

/* ----------------------------- TYPES ----------------------------- */

export interface Bucket {
  key: string;
  count: number;
}

export interface CompanyBucket extends Bucket {
  avg_ctc?: number | null;
  max_ctc?: number | null;
}

export interface InternshipDestination {
  company: string;
  location: string;
  count: number;
}

export interface RecentPlacement {
  _id: string;
  company: string;
  role: string;
  type: PlacementType;
  status: PlacementStatus;
  ctc_lpa?: number | null;
  stipend?: number | null;
  offer_date?: string | null;
  location?: string | null;
  student_name?: string;
  student_id?: string;
}

export interface DepartmentPlacement {
  key: string;
  total: number;
  placed: number;
  remaining: number;
  rate: number;
}

export interface DashboardFilters {
  university?: string;
  department?: string;
  batch_year?: number | string;
  course?: string;
  type?: string;
  from?: string;
  to?: string;
}

export interface FilterOptions {
  departments: string[];
  batches: number[];
  courses: { id: string; name: string; count: number }[];
  universities: string[];
  sectors: string[];
  types: string[];
}

export interface BoxStats {
  min: number; q1: number; median: number; q3: number; max: number;
  whisker_low: number; whisker_high: number; outliers: number[];
  mean: number; n: number;
}

export interface HeatCell {
  department: string; batch: number; total: number; placed: number; rate: number;
}

export interface RateRow { key: string; total: number; placed: number; rate: number }

export interface RoundDropoff { name: string; order: number; result: string; count: number }

export interface YoYRow {
  batch: number; total: number; placed: number; rate: number;
  median_ctc: number | null; avg_ctc: number | null;
}

export interface PlacementPolicy {
  one_offer_lock: boolean;
  allow_upgrade_to_higher_tier: boolean;
  dream_ctc_threshold: number;
  max_offers_per_student: number;
  default_min_cgpa?: number;
  default_max_backlogs?: number;
  session_start_month?: number;
}

export const INVITATION_STAGES = ['invited', 'responded', 'declined', 'scheduled', 'visited', 'hired'] as const;
export type InvitationStage = (typeof INVITATION_STAGES)[number];

export interface InvitationRow {
  _id: string;
  company: string;
  sector?: string;
  contact_name?: string;
  contact_email?: string;
  session: number;
  stage: InvitationStage;
  is_repeat: boolean;
  visit_date?: string;
  hires?: number;
  notes?: string;
}

export interface WaterfallData {
  opening: { _id: string; title: string; company: string };
  criteria: {
    min_cgpa: number; max_backlogs: number;
    departments: string[]; batches: number[]; universities: string[];
    allow_placed: boolean;
  };
  steps: { key: string; label: string; count: number; lost: number }[];
  eligible: number;
}

export interface DeptPlacement {
  key: string;
  total: number;
  placed: number;
  unplaced: number;
  rate: number;
}

export interface DashboardData {
  generated_at: string;
  final_year_batch: number;
  session: number;
  filters_applied: DashboardFilters;
  policy: PlacementPolicy;

  overview: {
    total_students: number;
    profiles_completed: number;
    profiles_missing: number;
    recruiters_active: number;
    recruiters_pending: number;
    openings_open: number;
    openings_closed: number;
    total_applications: number;
    students_placed: number;
    students_interning: number;
    seeking_placement: number;
    opted_out: number;
    placement_rate: number;
    placement_rate_all: number;
    median_ctc_lpa: number | null;
    avg_ctc_lpa: number | null;
    highest_ctc_lpa: number | null;
    lowest_ctc_lpa: number | null;
    p25_ctc_lpa: number | null;
    p75_ctc_lpa: number | null;
    median_stipend: number | null;
    avg_stipend: number | null;
    highest_stipend: number | null;
  };

  distribution: {
    by_university: Bucket[];
    by_department: Bucket[];
    by_course: Bucket[];
    by_batch: Bucket[];
    by_looking_for: Bucket[];
    by_cgpa: Bucket[];
    by_gender: Bucket[];
    outcome_composition: Bucket[];
    top_skills: Bucket[];
    skill_gap: { key: string; demand: number; supply: number }[];
  };

  applications: {
    funnel: Bucket[];
    trend: Bucket[];
    round_dropoff: RoundDropoff[];
    per_student: Bucket[];
    shortlisted: number;
    offered: number;
  };

  placements: {
    by_type: Bucket[];
    trend: Bucket[];
    ctc_bands: Bucket[];
    ctc_box: BoxStats | null;
    stipend_box: BoxStats | null;
    by_department: DeptPlacement[];
    heatmap: { departments: string[]; batches: number[]; cells: HeatCell[] };
    offers_per_student: (Bucket & { offers: number })[];
    cgpa_vs_placement: RateRow[];
    sectors: Bucket[];
    locations: Bucket[];
    top_companies: CompanyBucket[];
    internship_destinations: InternshipDestination[];
    recent: RecentPlacement[];
  };

  companies: {
    invitation_funnel: Bucket[];
    declined: number;
    churn: { session: number; repeat: number; fresh: number }[];
  };

  readiness: {
    avg_aptitude: number | null;
    avg_mock_score: number | null;
    avg_attendance: number | null;
    with_aptitude: number;
    mock_attended: number;
    resume_verified: number;
    total: number;
  } | null;

  trends: {
    yoy: YoYRow[];
    pacing: { months: string[]; series: { session: number; label: string; values: number[] }[] };
  };

  final_year: {
    batch: number;
    enrolled: number;
    opted_out: number;
    total: number;
    placed: number;
    remaining: number;
    rate: number;
    by_department: DepartmentPlacement[];
  };
}

export interface UnplacedStudent {
  _id: string;
  name: string;
  auid?: string;
  email?: string;
  university?: string;
  department: string | null;
  course: string | null;
  cgpa: number | null;
  backlogs: number;
  applications: number;
  aptitude_score: number | null;
  mock_interviews: number;
  risk: number;
  risk_band: 'high' | 'medium' | 'low';
}

export type PlacementType = 'internship' | 'job' | 'ppo';
export type PlacementStatus = 'offered' | 'accepted' | 'joined' | 'completed' | 'declined';

export interface PlacementRow {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName?: string;
    auid?: string;
    email?: string;
    university?: string;
  } | null;
  company: string;
  role: string;
  type: PlacementType;
  source: 'campus' | 'off_campus';
  location?: string;
  ctc_lpa?: number;
  stipend?: number;
  offer_date?: string;
  start_date?: string;
  status: PlacementStatus;
}

export interface PlacementPayload {
  student: string;
  company: string;
  role: string;
  type: PlacementType;
  source?: 'campus' | 'off_campus';
  location?: string;
  ctc_lpa?: number;
  stipend?: number;
  offer_date?: string;
  start_date?: string;
  status?: PlacementStatus;
  notes?: string;
}

/* ----------------------------- API ----------------------------- */

class AnalyticsApi {
  private instance: AxiosInstance;

  constructor() {
    this.instance = createHttp(20000);
  }

  async dashboard(filters: DashboardFilters = {}): Promise<DashboardData> {
    const res = await this.instance.get<{ success: boolean; data: DashboardData }>(
      '/api/admin/analytics/dashboard',
      { params: filters }
    );
    return res.data.data;
  }

  async filterOptions(): Promise<FilterOptions> {
    const res = await this.instance.get<{ success: boolean; data: FilterOptions }>(
      '/api/admin/analytics/filters'
    );
    return res.data.data;
  }

  async unplaced(filters: DashboardFilters = {}): Promise<UnplacedStudent[]> {
    const res = await this.instance.get<{ success: boolean; data: UnplacedStudent[] }>(
      '/api/admin/analytics/unplaced',
      { params: filters }
    );
    return res.data.data;
  }

  async listPlacements(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    q?: string;
  }): Promise<{ data: PlacementRow[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const res = await this.instance.get('/api/admin/placements', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  }

  async createPlacement(payload: PlacementPayload): Promise<PlacementRow> {
    const res = await this.instance.post('/api/admin/placements', payload);
    return res.data.data;
  }

  async updatePlacement(id: string, payload: Partial<PlacementPayload>): Promise<PlacementRow> {
    const res = await this.instance.put(`/api/admin/placements/${id}`, payload);
    return res.data.data;
  }

  async deletePlacement(id: string): Promise<void> {
    await this.instance.delete(`/api/admin/placements/${id}`);
  }

  /* --------------------------- TPO tooling --------------------------- */

  async getPolicy(): Promise<PlacementPolicy> {
    const res = await this.instance.get('/api/admin/policy');
    return res.data.data;
  }

  async updatePolicy(payload: Partial<PlacementPolicy>): Promise<PlacementPolicy> {
    const res = await this.instance.put('/api/admin/policy', payload);
    return res.data.data;
  }

  async listInvitations(params?: { session?: number; stage?: string; q?: string }): Promise<InvitationRow[]> {
    const res = await this.instance.get('/api/admin/invitations', { params });
    return res.data.data;
  }

  async createInvitation(payload: Partial<InvitationRow>): Promise<InvitationRow> {
    const res = await this.instance.post('/api/admin/invitations', payload);
    return res.data.data;
  }

  async updateInvitation(id: string, payload: Partial<InvitationRow>): Promise<InvitationRow> {
    const res = await this.instance.put(`/api/admin/invitations/${id}`, payload);
    return res.data.data;
  }

  async deleteInvitation(id: string): Promise<void> {
    await this.instance.delete(`/api/admin/invitations/${id}`);
  }

  /** TPO-owned academic + readiness fields (students cannot self-edit these). */
  async updateStudentRecord(userId: string, payload: Record<string, unknown>): Promise<unknown> {
    const res = await this.instance.put(`/api/admin/students/${userId}/record`, payload);
    return res.data.data;
  }
}

const analytics = new AnalyticsApi();
export default analytics;
