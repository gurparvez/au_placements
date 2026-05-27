# SRS Gap Analysis: University Placement & Career Portal

Date reviewed: 22 May 2026  
SRS reviewed: `docs/SRS_UniversityPlacementPortal.docx`  
Repository reviewed: current frontend repository at `au_placements`

## Executive Summary

The current repository already has a React/Vite frontend for AU/EU student registration, login, student profile creation, profile viewing, and student discovery/filtering. It is closest to a student portfolio and recruiter discovery interface.

The SRS, however, defines a full placement-management platform with student jobs, applications, eligibility, recruiter approvals, internal job posting, four admin panels, inbox notifications, audit logs, reports, placement drives, interview workflows, resume generation, and on-premise deployment constraints. Most of those platform-level modules are not present in this repository.

Phase 1 alignment has started addressing the SRS cloudless/on-premise constraint: the frontend now defaults to a local backend, and the backend active path is being moved from Cloudinary/Gemini-style services to local media storage and Python OCR.

## What Is Already There

### Project Foundation

- React + Vite + TypeScript frontend.
- Redux Toolkit state management.
- React Router route structure.
- Tailwind/Shadcn-style UI components.
- Theme provider, navbar, error boundary, reusable UI primitives.
- Public assets and landing/about pages.

Current routes:

- `/` landing page.
- `/about` about page.
- `/login` login and registration page.
- `/students` student discovery/listing page.
- `/profiles` logged-in student profile page.
- `/profiles/create` create student profile page.
- `/profiles/:userId` public student profile page.

### Authentication Frontend

Implemented or wired from the frontend:

- Student login using AUID/Roll No. and password.
- Student registration with:
  - AUID/Roll No.
  - First name and last name.
  - Email.
  - Phone.
  - Password.
  - University selection: Akal University or Eternal University.
  - ID card image upload.
- Current-user fetch on app load.
- Logout.
- Update user details and password API wrappers.
- Basic form validation for email, phone, required fields, password visibility toggles, and ID-card file type/size.

### Student Profile Frontend

Implemented or partially implemented:

- Create student profile form.
- Logged-in student profile view.
- Public student profile view.
- Student profile update flows through section components.
- Profile image upload.
- Basic info: headline, location, about, preferred field.
- Links: LinkedIn and GitHub.
- Resume upload and resume link display.
- Looking-for status:
  - Internship or job.
  - Available-from and optional available-until dates.
- Skills picker.
- Education entries using course picker.
- Experience entries.
- Project entries with technologies, code URL, live URL, description, dates, ongoing flag.
- Certificates with issuer, issue date, certificate URL, valid-until date.

### Student Discovery / Recruiter-Facing Search

Implemented in the frontend:

- List all student profiles.
- Search by name, headline, skills, or preferred field.
- Filter by:
  - Skills.
  - University.
  - Opportunity type: internship or job.
  - Availability dates.
  - Experience range.
  - Preferred field.
- Student cards linking to public profiles.
- Public profile includes contact details and a `mailto:` outreach template.

### API Wrappers Present

Frontend API wrappers exist for:

- Auth:
  - Register.
  - Login.
  - Logout.
  - Get current user.
  - Update user details.
  - Update password.
- Student profiles:
  - Create profile.
  - Update profile.
  - Get logged-in profile.
  - Get all students.
  - Get any student profile by user id.
- Skills:
  - List skills.
  - Search skills.
  - Get skill by id.
  - Add skill.
- Courses:
  - Search courses.
  - Create course.
  - Get course by id.

## What Is Partially There Compared To The SRS

### Student Registration & Authentication

Partially present:

- Student registration and login UI exists.
- AU/EU university selection exists.
- ID card upload exists.
- README claims AI-based identity verification, but this repository only contains the frontend wiring; backend verification is not verifiable here.

Missing or not visible:

- Official AU/EU email domain enforcement.
- Email OTP or activation-link verification flow.
- Forgot-password/account recovery UI.
- Programme, branch/department, and batch year fields during registration.
- Explicit session-management UI/logic beyond current-user fetch and cookie-based API calls.

### Profile Management

Partially present:

- Personal/profile info, skills, projects, certificates, work experience, education, profile image, LinkedIn/GitHub, and resume upload exist.

Missing or not visible:

- Semester-wise academic records and CGPA/marks.
- Achievements and extra-curricular activities.
- Multiple dynamic social/professional links beyond LinkedIn/GitHub.
- Supporting document uploads for marksheets, certificates, offer letters.
- Profile completion percentage.
- Semester-start profile review prompt.
- Version-tracked academic/profile history.
- SRS photo size requirement is max 2 MB, while current UI allows 5 MB.

### Resume Handling

Partially present:

- Students can upload an existing PDF/DOC/DOCX resume.
- Resume link can be displayed and changed.

Missing:

- Server-side generated PDF/DOCX resume from profile data.
- One-click resume generation.
- Resume templates.
- Resume version history.
- Timestamped generated resume storage.
- Admin/TPO resume download and bulk ZIP download.

### AU/EU Separation

Partially present:

- User/profile data includes a university value.
- Student listing can filter by university.

Missing or not visible:

- Database-level logical partitioning.
- Role/session-scoped AU vs EU data isolation.
- Separate AU and EU admin scopes.
- Distinct AU/EU branding.

## Major SRS Modules Still Needed

### Job / Opportunity Discovery

Not present in this repository:

- Job/opportunity listing pages.
- Eligible jobs feed for students.
- Job details with company, role, CTC/stipend, location, eligibility, deadline, and type.
- Search/filter jobs by type, branch, company, and deadline.
- One-click apply flow.
- Eligible/Not Eligible badge with ineligibility reason.
- Prevention of ineligible applications.

### Job Posting Module

Not present:

- Internal faculty/department login and role.
- Internal opportunity creation, editing, closing, applicant viewing.
- Third-party recruiter account request form.
- Recruiter approval/rejection/request-more-info workflow.
- Approved recruiter login and job-posting flow.
- Recruiter applicant profile viewing with privacy restrictions.
- Shortlisting, interview scheduling, candidate status updates.

### Admin Panels

Not present:

- AU Super Admin panel for Harmeet Sir.
- AU Admin panel for Sukhjeet Sir.
- AU TPO panel.
- EU Admin panel.
- Role-based admin routing.
- User management for students, internal posters, recruiters, and admins.
- Server-side configuration screens.
- Approval queues.
- Placement drive management.
- Interview schedule management.
- Student placement status management.
- Admin dashboards with active students, drives, pending approvals, recent activity.

### Inbox & Notification System

Not present:

- In-platform inbox.
- Notification icon/badge.
- Read/unread states.
- Notifications for jobs, applications, shortlists, interviews, offers, profile reminders, recruiter approvals, and admin announcements.
- Reply support.
- Email notification integration for critical events.
- Bulk announcements.
- Notification preferences.
- Search, pagination, and archival.

### Reports & History

Not present:

- Student history tab.
- Eligible/applied/interview/offer counts.
- Interview-round history and outcome tracking.
- Student history PDF download.
- Placement summary reports.
- Company reports.
- Student-wise reports.
- Drive reports.
- Pending-action reports.
- PDF and Excel export.
- Historical immutable academic-year reports.

### Eligibility Engine

Not present:

- Eligibility criteria model for jobs/drives.
- Automatic eligibility computation.
- Re-evaluation after profile updates.
- Stored eligible-student results.
- Ineligibility reason tooltips.
- Manual TPO/Admin override with mandatory reason.

### Applications, Drives, Interviews, Offers

Not present:

- Application entity and workflow.
- Placement drive entity and workflow.
- Interview round scheduling.
- Written/technical/HR/final outcomes.
- Offer status, CTC/stipend, acceptance/decline tracking.
- Placement freeze rules for placed students.

### Audit Logging

Not present:

- Admin action audit logs.
- Recruiter approval/rejection logs.
- Profile version history.
- Eligibility override logs.
- Destructive-operation re-authentication.

### Non-Functional / Deployment Requirements

Not present or not verifiable in this frontend repository:

- Full on-premise deployment plan.
- Production-ready no-public-cloud deployment compliance.
- Backup and retention policy for local media files.
- Server-side PDF generation.
- HTTPS/TLS setup.
- API-layer RBAC.
- Password hashing implementation.
- Login/registration rate limiting.
- File upload malware scanning.
- Daily database backups and retention.
- OpenAPI/Swagger API specification.
- Performance validation for 500 concurrent users, 10,000-student eligibility processing, and report generation.

## Recommended Build Plan

### Phase 1: Align Architecture With SRS

- Decide whether this repo remains frontend-only or becomes a monorepo with backend code.
- Keep backend URLs environment-driven and document local/on-prem setup.
- Define database schema for users, students, profiles, jobs, applications, drives, recruiters, inbox messages, audit logs, reports, and resume versions.
- Implement RBAC and AU/EU partitioning at the API and database levels.
- Continue replacing cloud-only services with on-prem OCR/storage and document any approved exceptions.

### Phase 2: Complete Student Core

- Add missing registration fields: programme, branch/department, batch year.
- Add official email-domain validation and email verification.
- Add forgot-password/account recovery.
- Add semester-wise academic records with CGPA/marks and version history.
- Add achievements, extra-curricular activities, arbitrary links, and supporting documents.
- Add profile completion percentage and semester review reminder.

### Phase 3: Build Jobs, Applications, And Eligibility

- Build job listing and job detail pages.
- Add internal poster and recruiter job-posting flows.
- Implement eligibility criteria and eligibility engine.
- Add student eligible-jobs dashboard.
- Add one-click apply and application status tracking.
- Add ineligible application prevention with clear reasons.

### Phase 4: Build Recruiter And Internal Poster Workflows

- Add recruiter account request and approval flow.
- Add approved recruiter dashboard.
- Add applicant list, shortlisting, interview scheduling, and status updates.
- Add internal faculty/department poster role and posting tools.

### Phase 5: Build Admin/TPO Panels

- Implement AU Super Admin, AU Admin, AU TPO, and EU Admin dashboards.
- Add user management, approvals, drives, interview scheduling, student placement status, reports, and audit views.
- Enforce all permissions server-side.

### Phase 6: Build Communication, Reports, And Resume Generation

- Add inbox and notification system.
- Add critical email notifications.
- Add bulk announcements and preferences.
- Add server-side PDF/DOCX resume generation with templates and history.
- Add reports with PDF/Excel export.
- Add student placement history and downloadable history report.

### Phase 7: Hardening And Acceptance

- Add API documentation.
- Add automated tests for auth, RBAC, eligibility, applications, notifications, and reports.
- Add load/performance testing.
- Add backup/restore process.
- Add security checks for rate limits, upload restrictions, malware scanning, HTTPS, and destructive-action re-authentication.
- Prepare on-premise deployment documentation for Ubuntu/Nginx/database/process manager.

## Current Status By SRS Area

| SRS Area | Current Status |
| --- | --- |
| Student registration/login | Partial |
| Student profile management | Partial |
| Resume generation | Missing; resume upload only |
| Job discovery | Missing |
| Student applications | Missing |
| Internal job posting | Missing |
| Recruiter account approval | Missing |
| Recruiter job posting | Missing |
| Admin panels | Missing |
| TPO workflows | Missing |
| Inbox/notifications | Missing |
| Reports/history | Missing |
| Eligibility engine | Missing |
| AU/EU data isolation | Partial UI-level only |
| Audit logs | Missing |
| On-premise/cloudless deployment | Not aligned |
| API/backend verification | Not possible from this frontend repo alone |
