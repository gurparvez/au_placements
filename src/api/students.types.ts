/* -------------------------------------------------------------------------- */
/*                             REQUEST INTERFACES                              */
/* -------------------------------------------------------------------------- */

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

export interface EducationPayload {
  institute: string;
  from_date: string;
  to_date: string;
  course: string;
  specialization?: string;
}

export interface CertificatePayload {
  name: string;
  issued_by: string;
  issue_date: string;
  certificate_url?: string;   // 🔵 now optional
  valid_until?: string;
}

export interface CreateStudentProfilePayload {
  headline?: string;
  location: string;
  about?: string;

  linkedin_url?: string;
  github_url?: string;

  resume?: File | null; 

  looking_for?: ("internship" | "job")[];      // 🔵 optional

  experience?: ExperiencePayload[];            // 🔵 optional
  projects?: ProjectPayload[];                 // 🔵 optional
  certificates?: CertificatePayload[];         // 🔵 optional

  preferred_field?: string;

  skills?: string[];                           // optional
  education?: EducationPayload[];

  profile_image?: File | null;                 // optional
}

export type UpdateStudentProfilePayload = Partial<CreateStudentProfilePayload>;

/* -------------------------------------------------------------------------- */
/*                             RESPONSE INTERFACES                             */
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
  institute: string;
  from_date: string;
  to_date: string;
  course: any;
  specialization: string;
}

export interface StudentProfileResponse {
  _id: string;
  user: any;
  headline: string;
  location: string;
  about: string;
  linkedin_url: string;
  preferred_field: String,
  github_url: string;
  resume_link: string;
  looking_for: string[];
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
