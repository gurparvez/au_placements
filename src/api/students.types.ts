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
  certificate_url?: string;
  valid_until?: string;
}

export interface AcademicRecordPayload {
  semester: number;
  academic_year?: string;
  cgpa?: number;
  marks_percentage?: number;
  backlog_count?: number;
}

export interface ProfileLinkPayload {
  label: string;
  url: string;
}

export interface ProfileNotePayload {
  title: string;
  description?: string;
  date?: string;
}

export interface CreateStudentProfilePayload {
  headline?: string;
  location: string;
  about?: string;

  linkedin_url?: string;
  github_url?: string;

  resume?: File | null;
  supporting_documents?: File[];

  // 🔵 Updated: Single object payload
  looking_for?: LookingForPayload;

  academic_records?: AcademicRecordPayload[];
  experience?: ExperiencePayload[];
  projects?: ProjectPayload[];
  certificates?: CertificatePayload[];
  achievements?: ProfileNotePayload[];
  extracurricular_activities?: ProfileNotePayload[];
  links?: ProfileLinkPayload[];

  preferred_field?: string;

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
  institute: string;
  from_date: string;
  to_date: string;
  course: any;
  specialization: string;
}

export interface AcademicRecordResponse {
  _id: string;
  semester: number;
  academic_year?: string;
  cgpa?: number;
  marks_percentage?: number;
  backlog_count?: number;
  updated_at?: string;
}

export interface ProfileLinkResponse {
  _id: string;
  label: string;
  url: string;
}

export interface ProfileNoteResponse {
  _id: string;
  title: string;
  description?: string;
  date?: string;
}

export interface SupportingDocumentResponse {
  _id: string;
  name: string;
  url: string;
  mime_type: string;
  uploaded_at: string;
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
  resume_link: string;
  links: ProfileLinkResponse[];
  supporting_documents: SupportingDocumentResponse[];

  looking_for: {
    type: 'internship' | 'job';
    from_date?: string;
    to_date?: string;
  };

  academic_records: AcademicRecordResponse[];
  cgpa_current?: number;
  experience: any[];
  total_experience: number;
  projects: ProjectResponse[];
  certificates: CertificateResponse[];
  achievements: ProfileNoteResponse[];
  extracurricular_activities: ProfileNoteResponse[];
  skills: any[];
  education: EducationResponse[];
  profile_completion: number;
  profile_version: number;
  last_profile_reviewed_at?: string;
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
    university: string;
    programme?: string;
    branch_department?: string;
    batch_year?: number;
    roles: string[];
    verified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  profile: StudentProfileResponse;
}
