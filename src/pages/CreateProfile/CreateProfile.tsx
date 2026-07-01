// src/pages/CreateProfile.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { createStudentProfile } from '@/context/student/studentSlice';
import {
  type CertificatePayload,
  type ExperiencePayload,
  type ProjectPayload,
} from '@/api/students.types';

import type { Course } from '@/api/courses';

import CoursePicker from '@/components/CoursePicker';
import SkillPicker from '@/components/SkillPicker';
import { isValidUrl } from '@/utils/validation';
import { X } from 'lucide-react';

// Interface for local state
interface LookingForState {
  type: 'internship' | 'job';
  from_date: string;
  to_date: string;
}

const CreateProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading } = useAppSelector((s) => s.student);

  // ---------------- BASIC INFO ----------------
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [preferredField, setPreferredField] = useState('');

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URL on unmount or when preview changes to prevent memory leaks
  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  // ---------------- LINKS & RESUME ----------------
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // ---------------- LOOKING FOR (Updated to Object) ----------------
  const [lookingFor, setLookingFor] = useState<LookingForState>({
    type: 'internship',
    from_date: '',
    to_date: '',
  });

  // ---------------- SKILLS ----------------
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // ---------------- EDUCATION ----------------
  const newEduRow = () => ({
    level: 'university' as 'university' | 'school',
    institute: '',
    from_date: '',
    to_date: '',
    courseId: '',
    courseName: '',
    category: '',
    specialization: '',
    board: '',
    grade: '',
    passing_year: '',
  });
  const [educationList, setEducationList] = useState([newEduRow()]);
  const setEdu = (index: number, patch: Partial<ReturnType<typeof newEduRow>>) =>
    setEducationList((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  // ---------------- EXPERIENCE ----------------
  const [experiences, setExperiences] = useState<ExperiencePayload[]>([]);

  // ---------------- PROJECTS ----------------
  const [projects, setProjects] = useState<ProjectPayload[]>([]);

  // ---------------- CERTIFICATES ----------------
  const [certificates, setCertificates] = useState<CertificatePayload[]>([]);

  // ---------------- ERRORS ----------------
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ---------------- VALIDATION ----------------
  const validate = () => {
    const e: { [key: string]: string } = {};

    if (!location.trim()) {
      e.location = 'Location is required';
    }

    // Validate Looking For Dates
    if (!lookingFor.from_date) {
      e.looking_for = 'Availability Start Date is required';
    }

    if (linkedinUrl && !isValidUrl(linkedinUrl)) e.linkedin_url = 'Invalid LinkedIn URL';
    if (githubUrl && !isValidUrl(githubUrl)) e.github_url = 'Invalid GitHub URL';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- Profile Image Handler ---
  const handleProfileImageChange = (file?: File) => {
    setProfileImageError(null);

    if (!file) {
      setProfileImage(null);
      setProfileImagePreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setProfileImageError('Only image files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileImageError('Image must be 5MB or smaller.');
      return;
    }

    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  // --- Resume Handler ---
  const handleResumeChange = (file?: File) => {
    setResumeError(null);

    if (!file) {
      setResumeFile(null);
      return;
    }

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      setResumeError('Only PDF or Word documents are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeError('Resume must be 5MB or smaller.');
      return;
    }

    setResumeFile(file);
  };

  /* ----------------------------------------------------------------------------------
      RENDER START
  ---------------------------------------------------------------------------------- */

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto flex max-w-[760px] flex-col px-6 pt-24 pb-10">
        <div className="mb-8">
          <span className="eyebrow">New register entry</span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your profile</h1>
          <p className="text-muted-foreground mt-2 max-w-[65ch] text-sm">
            Fill in your details to help companies discover you. Fields marked
            <span className="text-danger"> *</span> are required.
          </p>
        </div>

        <form onSubmit={() => {}} className="space-y-6">
          {/* BASIC INFO */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* PROFILE IMAGE */}
              <div className="space-y-2">
                <label htmlFor="profile-image-input" className="mb-1.5 block text-sm font-medium">
                  Profile Image <span className="text-muted-foreground">(optional)</span>
                </label>

                <input
                  ref={fileInputRef}
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleProfileImageChange(e.target.files?.[0])}
                />

                <div className="flex items-center gap-4">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Preview"
                      className="border-border h-20 w-20 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="bg-surface-2 text-muted-foreground border-border flex h-20 w-20 items-center justify-center rounded-full border text-xs">
                      No Image
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </Button>
                </div>

                {profileImageError && <p className="text-danger text-xs">{profileImageError}</p>}
              </div>

              <div>
                <label htmlFor="headline" className="mb-1.5 block text-sm font-medium">
                  Headline (optional)
                </label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Aspiring Software Developer"
                />
              </div>

              <div>
                <label htmlFor="location" className="mb-1.5 block text-sm font-medium">
                  Location <span className="text-danger">*</span>
                </label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bathinda, Punjab"
                  aria-invalid={!!errors.location}
                />
                {errors.location && <p className="text-danger mt-1 text-xs">{errors.location}</p>}
              </div>

              <div>
                <label htmlFor="about" className="mb-1.5 block text-sm font-medium">
                  About (optional)
                </label>
                <Textarea
                  id="about"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  placeholder="A passionate developer pursuing B.Tech CSE..."
                />
              </div>

              <div>
                <label htmlFor="preferred-field" className="mb-1.5 block text-sm font-medium">
                  Preferred Field (optional)
                </label>
                <Input
                  id="preferred-field"
                  value={preferredField}
                  onChange={(e) => setPreferredField(e.target.value)}
                  placeholder="Software Engineering, Data Science, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* LINKS & PREFERENCES */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Links &amp; Preferences</h2>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="linkedin-url" className="mb-1.5 block text-sm font-medium">
                    LinkedIn URL (optional)
                  </label>
                  <Input
                    id="linkedin-url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    aria-invalid={!!errors.linkedin_url}
                  />
                  {errors.linkedin_url && (
                    <p className="mt-1 text-danger text-xs">{errors.linkedin_url}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="github-url" className="mb-1.5 block text-sm font-medium">
                    GitHub URL (optional)
                  </label>
                  <Input
                    id="github-url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    aria-invalid={!!errors.github_url}
                  />
                  {errors.github_url && (
                    <p className="mt-1 text-danger text-xs">{errors.github_url}</p>
                  )}
                </div>
              </div>

              {/* Resume File Input */}
              <div>
                <label htmlFor="resume-input" className="mb-1.5 block text-sm font-medium">
                  Resume (optional)
                </label>

                <input
                  ref={resumeInputRef}
                  id="resume-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleResumeChange(e.target.files?.[0])}
                />

                <div className="mt-1.5 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resumeInputRef.current?.click()}
                  >
                    Upload Resume
                  </Button>

                  {resumeFile ? (
                    <div className="text-primary flex items-center gap-2 text-sm">
                      <span className="max-w-[200px] truncate font-medium">{resumeFile.name}</span>
                      <button
                        type="button"
                        aria-label="Remove resume"
                        onClick={() => setResumeFile(null)}
                        className="text-danger rounded-sm font-bold hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-soft)]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No file selected</span>
                  )}
                </div>

                {resumeError && <p className="mt-1 text-danger text-xs">{resumeError}</p>}
                <p className="text-muted-foreground mt-1 text-xs">
                  Accepted formats: PDF, DOC, DOCX. Max size: 5MB.
                </p>
              </div>

              <Separator />

              {/* LOOKING FOR SECTION */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  What are you looking for? <span className="text-danger">*</span>
                </label>

                <div className="mt-3 space-y-4">
                  {/* Type Selection */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    {/* Option 1: Internship */}
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="lookingForType"
                        value="internship"
                        checked={lookingFor.type === 'internship'}
                        onChange={() => setLookingFor((prev) => ({ ...prev, type: 'internship' }))}
                        className="accent-[var(--primary)] h-4 w-4"
                      />
                      <span>Internship</span>
                    </label>

                    {/* Option 2: Job */}
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="lookingForType"
                        value="job"
                        checked={lookingFor.type === 'job'}
                        onChange={() => setLookingFor((prev) => ({ ...prev, type: 'job' }))}
                        className="accent-[var(--primary)] h-4 w-4"
                      />
                      <span>Job / Placement</span>
                    </label>
                  </div>

                  {/* Date Range Selection */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="available-from"
                        className="text-muted-foreground mb-1 block text-xs"
                      >
                        Available From <span className="text-danger">*</span>
                      </label>
                      <Input
                        id="available-from"
                        type="date"
                        value={lookingFor.from_date}
                        onChange={(e) =>
                          setLookingFor((prev) => ({ ...prev, from_date: e.target.value }))
                        }
                        aria-invalid={!!errors.looking_for}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="available-until"
                        className="text-muted-foreground mb-1 block text-xs"
                      >
                        Available Until (Optional)
                      </label>
                      <Input
                        id="available-until"
                        type="date"
                        value={lookingFor.to_date}
                        onChange={(e) =>
                          setLookingFor((prev) => ({ ...prev, to_date: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  {errors.looking_for && (
                    <p className="text-danger text-xs">{errors.looking_for}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ---------------------- SKILLS ---------------------- */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Skills</h2>
            </CardHeader>

            <CardContent>
              <SkillPicker
                label="Your Skills"
                selected={selectedSkillIds}
                setSelected={setSelectedSkillIds}
              />
            </CardContent>
          </Card>

          {/* ---------------------- EDUCATION ---------------------- */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Education</h2>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEducationList((prev) => [...prev, newEduRow()])}
                >
                  Add Education
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {educationList.map((edu, index) => (
                <div key={index} className="bg-bg-2 border border-border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Education {index + 1}</span>
                    {educationList.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-danger hover:bg-danger-soft"
                        onClick={() =>
                          setEducationList((prev) => prev.filter((_, i) => i !== index))
                        }
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Level toggle: University vs School */}
                  <div className="inline-flex rounded-[9px] border border-border-strong bg-bg-2 p-1">
                    {(['university', 'school'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEdu(index, { level: lvl })}
                        className={
                          'rounded-[7px] px-3 py-1.5 text-[13px] font-medium capitalize transition-colors ' +
                          (edu.level === lvl
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:text-foreground')
                        }
                      >
                        {lvl === 'university' ? 'University' : 'School (10th / 12th)'}
                      </button>
                    ))}
                  </div>

                  {edu.level === 'university' ? (
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <label htmlFor={`edu-institute-${index}`} className="mb-1.5 block text-sm font-medium">
                          Institute <span className="text-danger">*</span>
                        </label>
                        <select
                          id={`edu-institute-${index}`}
                          value={edu.institute}
                          onChange={(e) => setEdu(index, { institute: e.target.value })}
                          className="bg-bg-2 border border-border-strong rounded-[9px] px-3 py-2 text-[14px] w-full outline-none transition-[color,box-shadow,border-color] focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[var(--ring-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="" disabled>
                            Select Institute
                          </option>
                          <option value="Akal University">Akal University</option>
                          <option value="Eternal University">Eternal University</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label id={`edu-course-label-${index}`} className="mb-1.5 block text-sm font-medium">
                            Course <span className="text-danger">*</span>
                          </label>
                          <CoursePicker
                            value={edu.courseName}
                            onSelect={(selectedCourse: Course) =>
                              setEdu(index, {
                                courseId: selectedCourse._id,
                                courseName: selectedCourse.name,
                                category: selectedCourse.category,
                              })
                            }
                          />
                        </div>

                        <div className="w-24">
                          <label htmlFor={`edu-category-${index}`} className="mb-1.5 block text-sm font-medium">
                            Category
                          </label>
                          <Input
                            id={`edu-category-${index}`}
                            readOnly
                            value={edu.category}
                            className="bg-surface-2 text-muted-foreground cursor-not-allowed"
                            placeholder="UG/PG"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <label htmlFor={`edu-school-${index}`} className="mb-1.5 block text-sm font-medium">
                          School name <span className="text-danger">*</span>
                        </label>
                        <Input
                          id={`edu-school-${index}`}
                          value={edu.institute}
                          onChange={(e) => setEdu(index, { institute: e.target.value })}
                          placeholder="e.g. Delhi Public School"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-32">
                          <label htmlFor={`edu-grade-${index}`} className="mb-1.5 block text-sm font-medium">
                            Class <span className="text-danger">*</span>
                          </label>
                          <select
                            id={`edu-grade-${index}`}
                            value={edu.grade}
                            onChange={(e) => setEdu(index, { grade: e.target.value })}
                            className="bg-bg-2 border border-border-strong rounded-[9px] px-3 py-2 text-[14px] w-full outline-none transition-[color,box-shadow,border-color] focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[var(--ring-soft)]"
                          >
                            <option value="" disabled>
                              Select
                            </option>
                            <option value="10th">10th</option>
                            <option value="12th">12th</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label htmlFor={`edu-board-${index}`} className="mb-1.5 block text-sm font-medium">
                            Board (optional)
                          </label>
                          <Input
                            id={`edu-board-${index}`}
                            value={edu.board}
                            onChange={(e) => setEdu(index, { board: e.target.value })}
                            placeholder="e.g. CBSE, ICSE, PSEB"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor={`edu-passing-${index}`} className="mb-1.5 block text-sm font-medium">
                          Passing year <span className="text-danger">*</span>
                        </label>
                        <Input
                          id={`edu-passing-${index}`}
                          type="number"
                          inputMode="numeric"
                          min={1950}
                          max={2100}
                          value={edu.passing_year}
                          onChange={(e) => setEdu(index, { passing_year: e.target.value })}
                          placeholder="e.g. 2020"
                        />
                      </div>
                    </div>
                  )}

                  {edu.level === 'university' && (
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <label htmlFor={`edu-from-${index}`} className="mb-1.5 block text-sm font-medium">
                          From Date <span className="text-danger">*</span>
                        </label>
                        <Input
                          id={`edu-from-${index}`}
                          type="date"
                          value={edu.from_date}
                          onChange={(e) => setEdu(index, { from_date: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor={`edu-to-${index}`} className="mb-1.5 block text-sm font-medium">
                          To Date <span className="text-danger">*</span>
                        </label>
                        <Input
                          id={`edu-to-${index}`}
                          type="date"
                          value={edu.to_date}
                          onChange={(e) => setEdu(index, { to_date: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {edu.level === 'university' && (
                    <div>
                      <label htmlFor={`edu-specialization-${index}`} className="mb-1.5 block text-sm font-medium">
                        Specialization (optional)
                      </label>
                      <Input
                        id={`edu-specialization-${index}`}
                        value={edu.specialization}
                        onChange={(e) => setEdu(index, { specialization: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ---------------------- EXPERIENCE ---------------------- */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Experience</h2>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setExperiences((prev) => [
                      ...prev,
                      { company: '', role: '', start_date: '', end_date: '', description: '' },
                    ])
                  }
                >
                  Add Experience
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {experiences.map((exp, index) => (
                <div key={index} className="bg-bg-2 border border-border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Experience {index + 1}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-danger hover:bg-danger-soft"
                      onClick={() => setExperiences((prev) => prev.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`exp-company-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Company <span className="text-danger">*</span>
                      </label>
                      <Input
                        id={`exp-company-${index}`}
                        value={exp.company}
                        onChange={(e) =>
                          setExperiences((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, company: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`exp-role-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Role <span className="text-danger">*</span>
                      </label>
                      <Input
                        id={`exp-role-${index}`}
                        value={exp.role}
                        onChange={(e) =>
                          setExperiences((prev) =>
                            prev.map((r, i) => (i === index ? { ...r, role: e.target.value } : r))
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`exp-start-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Start Date <span className="text-danger">*</span>
                      </label>
                      <Input
                        id={`exp-start-${index}`}
                        type="date"
                        value={exp.start_date}
                        onChange={(e) =>
                          setExperiences((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, start_date: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`exp-end-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        End Date
                      </label>
                      <Input
                        id={`exp-end-${index}`}
                        type="date"
                        value={exp.end_date}
                        onChange={(e) =>
                          setExperiences((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, end_date: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`exp-description-${index}`}
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Description (optional)
                    </label>
                    <Textarea
                      id={`exp-description-${index}`}
                      rows={3}
                      value={exp.description}
                      onChange={(e) =>
                        setExperiences((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, description: e.target.value } : r
                          )
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ---------------------- PROJECTS ---------------------- */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Projects</h2>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setProjects((prev) => [
                      ...prev,
                      {
                        title: '',
                        start_date: '',
                        end_date: '',
                        on_going: false,
                        tech_used: [],
                        code_url: '',
                        live_url: '',
                        description: '',
                      },
                    ])
                  }
                >
                  Add Project
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {projects.map((pr, index) => (
                <div key={index} className="bg-bg-2 border border-border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Project {index + 1}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-danger hover:bg-danger-soft"
                      onClick={() => setProjects((prev) => prev.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>

                  <div>
                    <label
                      htmlFor={`project-title-${index}`}
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Title <span className="text-danger">*</span>
                    </label>
                    <Input
                      id={`project-title-${index}`}
                      value={pr.title}
                      onChange={(e) =>
                        setProjects((prev) =>
                          prev.map((r, i) => (i === index ? { ...r, title: e.target.value } : r))
                        )
                      }
                    />
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`project-start-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Start Date <span className="text-danger">*</span>
                      </label>
                      <Input
                        id={`project-start-${index}`}
                        type="date"
                        value={pr.start_date}
                        onChange={(e) =>
                          setProjects((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, start_date: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`project-end-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        End Date
                      </label>
                      <Input
                        id={`project-end-${index}`}
                        type="date"
                        value={pr.end_date}
                        onChange={(e) =>
                          setProjects((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, end_date: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={pr.on_going}
                      onChange={(e) =>
                        setProjects((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, on_going: e.target.checked } : r
                          )
                        )
                      }
                      className="accent-[var(--primary)] h-4 w-4"
                    />
                    Ongoing
                  </label>

                  <div>
                    <label
                      htmlFor={`project-description-${index}`}
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Description (optional)
                    </label>
                    <Textarea
                      id={`project-description-${index}`}
                      rows={3}
                      value={pr.description}
                      onChange={(e) =>
                        setProjects((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, description: e.target.value } : r
                          )
                        )
                      }
                    />
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`project-code-url-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Code URL
                      </label>
                      <Input
                        id={`project-code-url-${index}`}
                        value={pr.code_url}
                        onChange={(e) =>
                          setProjects((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, code_url: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`project-live-url-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Live URL
                      </label>
                      <Input
                        id={`project-live-url-${index}`}
                        value={pr.live_url}
                        onChange={(e) =>
                          setProjects((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, live_url: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Tech Used */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Technologies Used</label>
                    <SkillPicker
                      selected={pr.tech_used}
                      setSelected={(ids) =>
                        setProjects((prev) =>
                          prev.map((r, i) => (i === index ? { ...r, tech_used: ids } : r))
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ---------------------- CERTIFICATES ---------------------- */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Certificates</h2>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCertificates((prev) => [
                      ...prev,
                      {
                        name: '',
                        issued_by: '',
                        issue_date: '',
                        certificate_url: '',
                        valid_until: '',
                      },
                    ])
                  }
                >
                  Add Certificate
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {certificates.map((cert, index) => (
                <div key={index} className="bg-bg-2 border border-border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Certificate {index + 1}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-danger hover:bg-danger-soft"
                      onClick={() => setCertificates((prev) => prev.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`cert-name-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Name <span className="text-danger">*</span>
                      </label>
                      <Input
                        id={`cert-name-${index}`}
                        value={cert.name}
                        onChange={(e) =>
                          setCertificates((prev) =>
                            prev.map((r, i) => (i === index ? { ...r, name: e.target.value } : r))
                          )
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`cert-issued-by-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Issued By <span className="text-danger">*</span>
                      </label>
                      <Input
                        id={`cert-issued-by-${index}`}
                        value={cert.issued_by}
                        onChange={(e) =>
                          setCertificates((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, issued_by: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`cert-issue-date-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Issue Date <span className="text-danger">*</span>
                      </label>
                      <Input
                        id={`cert-issue-date-${index}`}
                        type="date"
                        value={cert.issue_date}
                        onChange={(e) =>
                          setCertificates((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, issue_date: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`cert-valid-until-${index}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Valid Until
                      </label>
                      <Input
                        id={`cert-valid-until-${index}`}
                        type="date"
                        value={cert.valid_until}
                        onChange={(e) =>
                          setCertificates((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, valid_until: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`cert-url-${index}`}
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Certificate URL
                    </label>
                    <Input
                      id={`cert-url-${index}`}
                      value={cert.certificate_url}
                      onChange={(e) =>
                        setCertificates((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, certificate_url: e.target.value } : r
                          )
                        )
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ---------------------- SUBMIT / SAVE BAR ---------------------- */}
          <Card className="sticky bottom-4 z-10 flex-row items-center justify-between gap-4 py-4">
            <div className="min-w-0 px-6 text-sm">
              {Object.keys(errors).length > 0 ? (
                <p className="text-danger">
                  Please fix {Object.keys(errors).length} field
                  {Object.keys(errors).length > 1 ? 's' : ''} before saving.
                </p>
              ) : (
                <p className="text-muted-foreground">Review your details, then save your profile.</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 px-6">
              <Button type="button" variant="ghost" onClick={() => navigate('/profiles')}>
                Skip for now
              </Button>
              <Button
                type="submit"
                disabled={loading}
                onClick={async (e) => {
                e.preventDefault();
                if (!validate()) return;

                // 1. Prepare the Plain Object Payload
                const payload: any = {
                  headline,
                  location,
                  about,
                  preferred_field: preferredField || undefined,
                  linkedin_url: linkedinUrl || undefined,
                  github_url: githubUrl || undefined,
                  resume: resumeFile || undefined,
                  skills: selectedSkillIds.length ? selectedSkillIds : undefined,
                  profile_image: profileImage,

                  // Pass the SINGLE object directly
                  looking_for: {
                    type: lookingFor.type,
                    from_date: lookingFor.from_date,
                    to_date: lookingFor.to_date || undefined,
                  },

                  education: educationList
                    .filter((e) =>
                      e.level === 'university'
                        ? e.institute && e.courseId && e.from_date && e.to_date
                        : e.institute && e.grade && e.passing_year
                    )
                    .map((edu) =>
                      edu.level === 'university'
                        ? {
                            level: 'university' as const,
                            institute: edu.institute,
                            from_date: edu.from_date,
                            to_date: edu.to_date,
                            course: edu.courseId,
                            specialization: edu.specialization || undefined,
                          }
                        : {
                            level: 'school' as const,
                            institute: edu.institute,
                            grade: edu.grade,
                            board: edu.board || undefined,
                            passing_year: edu.passing_year ? Number(edu.passing_year) : undefined,
                          }
                    ),

                  experience: experiences
                    .filter((e) => e.company && e.role && e.start_date)
                    .map((exp) => ({
                      ...exp,
                      end_date: exp.end_date || undefined,
                      description: exp.description || undefined,
                    })),

                  projects: projects
                    .filter((p) => p.title && p.start_date)
                    .map((p) => ({
                      ...p,
                      end_date: p.end_date || undefined,
                      code_url: p.code_url || undefined,
                      live_url: p.live_url || undefined,
                      description: p.description || undefined,
                    })),

                  certificates: certificates
                    .filter((c) => c.name && c.issued_by && c.issue_date)
                    .map((c) => ({
                      ...c,
                      certificate_url: c.certificate_url || undefined,
                      valid_until: c.valid_until || undefined,
                    })),
                };

                // 2. Pass the OBJECT to the redux action
                const res = await dispatch(createStudentProfile(payload));

                if (createStudentProfile.fulfilled.match(res)) {
                  navigate('/profiles');
                }
              }}
              >
                {loading ? 'Saving…' : 'Save profile'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </main>
  );
};

export default CreateProfile;
