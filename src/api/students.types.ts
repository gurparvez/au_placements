/* -------------------------------------------------------------------------- */
/*                             REQUEST INTERFACES                             */
/* -------------------------------------------------------------------------- */

export interface LookingForPayload {
  type: 'internship' | 'job';
  from_date?: string;
  to_date?: string;
}

export interface ExperiencePayload {
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface ProjectPayload {
  title: string;
  start_date: string;
  end_date?: string;
  on_going?: boolean;
  tech_used: string[];
  code_url?: string;
  live_url?: string;
  description?: string;
}

export type EducationLevel = 'university' | 'school';

export interface EducationPayload {
  level: EducationLevel;
  institute: string;
  from_date?: string;
  to_date?: string;
  course?: string; // university only
  specialization?: string; // university only
  board?: string; // school only
  grade?: string; // school only (e.g. 10th, 12th)
  passing_year?: number; // school only
}

export interface CertificatePayload {
  name: string;
  issued_by: string;
  issue_date: string;
  certificate_url?: string;
  valid_until?: string;
}

export interface CreateStudentProfilePayload {
  headline?: string;
  location: string;
  about?: string;

  linkedin_url?: string;
  github_url?: string;

  resume?: File | null;

  // 🔵 Updated: Single object payload
  looking_for?: LookingForPayload;

  experience?: ExperiencePayload[];
  projects?: ProjectPayload[];
  certificates?: CertificatePayload[];

  preferred_field?: string;

  // Academic record used for TPC reporting (department / course / batch cohorts).
  department?: string;
  course?: string;
  batch_year?: number;
  cgpa?: number;
  backlogs?: number;

  skills?: string[];
  education?: EducationPayload[];

  profile_image?: File | null;
}

export type UpdateStudentProfilePayload = Partial<CreateStudentProfilePayload>;

/* -------------------------------------------------------------------------- */
/*                             RESPONSE INTERFACES                            */
/* -------------------------------------------------------------------------- */

export interface ProjectResponse {
  _id: string;
  title: string;
  start_date: string;
  on_going: boolean;
  tech_used: string[];
  description: string;
}

export interface CertificateResponse {
  _id: string;
  name: string;
  issued_by: string;
  issue_date: string;
  certificate_url: string;
  valid_until: string;
}

export interface EducationResponse {
  _id: string;
  level?: EducationLevel;
  institute: string;
  from_date?: string;
  to_date?: string;
  course?: any; // university only
  specialization?: string; // university only
  board?: string; // school only
  grade?: string; // school only
  passing_year?: number; // school only
}

export interface StudentProfileResponse {
  _id: string;
  user: any;
  headline: string;
  location: string;
  about: string;
  linkedin_url: string;
  preferred_field: string;
  github_url: string;

  department?: string;
  course?: any;
  batch_year?: number;
  cgpa?: number;
  backlogs?: number;

  resume_link: string;

  looking_for: {
    type: 'internship' | 'job';
    from_date?: string;
    to_date?: string;
  };

  experience: any[];
  total_experience: number;
  projects: ProjectResponse[];
  certificates: CertificateResponse[];
  skills: any[];
  education: EducationResponse[];
  createdAt: string;
  updatedAt: string;
  profile_image?: string;
}

export interface GetAnyStudentProfileRequest {
  userId: string;
}

export interface GetAnyStudentProfileResponse {
  success: boolean;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    roles: string[];
    verified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  profile: StudentProfileResponse;
}
