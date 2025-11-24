// src/pages/CreateProfile.tsx

import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { createStudentProfile } from '@/context/student/studentSlice';
import type { CreateStudentProfilePayload } from '@/api/students.types';

import type { Course } from '@/api/courses';

import CoursePicker from '@/components/CoursePicker';
import SkillPicker from '@/components/SkillPicker';

const CreateProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error } = useAppSelector((s) => s.student);

  // ---------------- BASIC INFO ----------------
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [preferredField, setPreferredField] = useState('');

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------- LINKS ----------------
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [resumeLink, setResumeLink] = useState('');

  // ---------------- LOOKING FOR ----------------
  const [lookingFor, setLookingFor] = useState<string>('internship');

  // ---------------- SKILLS ----------------
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // ---------------- EDUCATION (initial row) ----------------
  const [educationList, setEducationList] = useState([
    {
      institute: '',
      from_date: '',
      to_date: '',
      courseId: '', // Stores the ID (for backend)
      courseName: '', // Stores the Name (for picker display)
      category: '', // Stores category (ug/pg)
      specialization: '',
    },
  ]);

  // ---------------- EXPERIENCE ----------------
  const [experiences, setExperiences] = useState([]);

  // ---------------- PROJECTS ----------------
  const [projects, setProjects] = useState([]);

  // ---------------- CERTIFICATES ----------------
  const [certificates, setCertificates] = useState([]);

  // ---------------- ERRORS ----------------
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ---------------- VALIDATION ----------------
  const validate = () => {
    const e: { [key: string]: string } = {};

    if (!location.trim()) {
      e.location = 'Location is required';
    }

    const urlRegex = /^https?:\/\/.+/i;

    if (linkedinUrl && !urlRegex.test(linkedinUrl)) e.linkedin_url = 'Invalid LinkedIn URL';
    if (githubUrl && !urlRegex.test(githubUrl)) e.github_url = 'Invalid GitHub URL';
    if (resumeLink && !urlRegex.test(resumeLink)) e.resume_link = 'Invalid resume link';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProfileImageChange = (file?: File) => {
    setProfileImageError(null);

    if (!file) {
      setProfileImage(null);
      setProfileImagePreview(null);
      return;
    }

    // Validate image type
    if (!file.type.startsWith('image/')) {
      setProfileImageError('Only image files are allowed.');
      return;
    }

    // Max size 5MB
    if (file.size > 5 * 1024 * 1024) {
      setProfileImageError('Image must be 5MB or smaller.');
      return;
    }

    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  /* ----------------------------------------------------------------------------------
     RENDER START
  ---------------------------------------------------------------------------------- */

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 pt-24 pb-10">
        <div className="mb-6 text-center">
          <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            AU Placements
          </h2>
          <h1 className="mt-2 text-2xl font-semibold">Create Your Student Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Fill in your details to help companies discover you.
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Fields marked with * are required.</p>
        </div>

        <form onSubmit={() => {}} className="space-y-6">
          {/* BASIC INFO */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Basic Information</h2>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* PROFILE IMAGE */}
              {/* PROFILE IMAGE */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Profile Image <span className="text-red-500">*</span>
                </label>

                {/* 1. Add ref here */}
                <input
                  ref={fileInputRef}
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden" // You can use hidden or absolute left-[-9999px]
                  onChange={(e) => handleProfileImageChange(e.target.files?.[0])}
                />

                <div className="flex items-center gap-4">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Preview"
                      className="h-20 w-20 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="bg-muted text-muted-foreground flex h-20 w-20 items-center justify-center rounded-full border text-xs">
                      No Image
                    </div>
                  )}

                  {/* 2. Remove the <label> wrapper, add onClick to Button directly */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </Button>
                </div>

                {profileImageError && <p className="text-xs text-red-500">{profileImageError}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Headline (optional)</label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Aspiring Software Developer"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Location <span className="text-red-500">*</span>
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bathinda, Punjab"
                />
                {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">About (optional)</label>
                <Textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  placeholder="A passionate developer pursuing B.Tech CSE..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Preferred Field (optional)</label>
                <Input
                  value={preferredField}
                  onChange={(e) => setPreferredField(e.target.value)}
                  placeholder="Software Engineering, Data Science, etc."
                />
              </div>
            </CardContent>
          </Card>
          {/* LINKS & OPEN TO */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Links & Preferences</h2>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">LinkedIn URL (optional)</label>
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">GitHub URL (optional)</label>
                  <Input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Resume Link (optional)</label>
                <Input
                  value={resumeLink}
                  onChange={(e) => setResumeLink(e.target.value)}
                  placeholder="Google Drive link etc."
                />
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium">
                  Open To <span className="text-red-500">*</span>
                </label>

                <div className="mt-2 flex flex-wrap gap-6 text-sm">
                  {/* Option 1: Internship */}
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="lookingFor"
                      value="internship"
                      checked={lookingFor === 'internship'}
                      onChange={() => setLookingFor('internship')}
                      className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                    />
                    <span>Internship</span>
                  </label>

                  {/* Option 2: Job */}
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="lookingFor"
                      value="job"
                      checked={lookingFor === 'job'}
                      onChange={() => setLookingFor('job')}
                      className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                    />
                    <span>Job / Placement</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* ---------------------- SKILLS (updated with SkillPicker) ---------------------- */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Skills</h2>
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
                <h2 className="text-lg font-semibold">Education</h2>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setEducationList((prev) => [
                      ...prev,
                      { institute: '', from_date: '', to_date: '', course: '', specialization: '' },
                    ])
                  }
                >
                  Add Education
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {educationList.map((edu, index) => (
                <div key={index} className="bg-muted/40 space-y-2 rounded-md border p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Education {index + 1}</span>
                    {educationList.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setEducationList((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">
                        Institute <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={edu.institute}
                        onChange={(e) =>
                          setEducationList((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, institute: e.target.value } : r
                            )
                          )
                        }
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                        <label className="text-sm font-medium">
                          Course <span className="text-red-500">*</span>
                        </label>
                        <CoursePicker
                          value={edu.courseName}
                          onSelect={(selectedCourse: Course) => {
                            setEducationList((prev) =>
                              prev.map((r, i) =>
                                i === index
                                  ? {
                                      ...r,
                                      courseId: selectedCourse._id,
                                      courseName: selectedCourse.name,
                                      category: selectedCourse.category,
                                    }
                                  : r
                              )
                            );
                          }}
                        />
                      </div>

                      {/* CATEGORY (Auto-filled) */}
                      <div className="w-24">
                        <label className="text-sm font-medium">Category</label>
                        <Input
                          readOnly
                          value={edu.category}
                          className="bg-muted text-muted-foreground cursor-not-allowed"
                          placeholder="UG/PG"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">
                        From Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={edu.from_date}
                        onChange={(e) =>
                          setEducationList((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, from_date: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        To Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={edu.to_date}
                        onChange={(e) =>
                          setEducationList((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, to_date: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Specialization (optional)</label>
                    <Input
                      value={edu.specialization}
                      onChange={(e) =>
                        setEducationList((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, specialization: e.target.value } : r
                          )
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          {/* ---------------------- EXPERIENCE ---------------------- */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Experience</h2>
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
                <div key={index} className="bg-muted/40 space-y-2 rounded-md border p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Experience {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setExperiences((prev) => prev.filter((_, i) => i !== index))}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <Input
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
                      <label className="text-sm font-medium">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <Input
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
                      <label className="text-sm font-medium">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <Input
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
                      <label className="text-sm font-medium">End Date</label>
                      <Input
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
                    <label className="text-sm font-medium">Description (optional)</label>
                    <Textarea
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
                <h2 className="text-lg font-semibold">Projects</h2>
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
                <div key={index} className="bg-muted/40 space-y-2 rounded-md border p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Project {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setProjects((prev) => prev.filter((_, i) => i !== index))}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
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
                      <label className="text-sm font-medium">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <Input
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
                      <label className="text-sm font-medium">End Date</label>
                      <Input
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
                    />
                    Ongoing
                  </label>

                  <div>
                    <label className="text-sm font-medium">Description (optional)</label>
                    <Textarea
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
                      <label className="text-sm font-medium">Code URL</label>
                      <Input
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
                      <label className="text-sm font-medium">Live URL</label>
                      <Input
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

                  {/* Tech Used (with SkillPicker) */}
                  <div>
                    <label className="text-sm font-medium">Technologies Used</label>

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
                <h2 className="text-lg font-semibold">Certificates</h2>
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
                <div key={index} className="bg-muted/40 space-y-2 rounded-md border p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Certificate {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setCertificates((prev) => prev.filter((_, i) => i !== index))}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Name *</label>
                      <Input
                        value={cert.name}
                        onChange={(e) =>
                          setCertificates((prev) =>
                            prev.map((r, i) => (i === index ? { ...r, name: e.target.value } : r))
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Issued By *</label>
                      <Input
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
                      <label className="text-sm font-medium">Issue Date *</label>
                      <Input
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
                      <label className="text-sm font-medium">Valid Until</label>
                      <Input
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
                    <label className="text-sm font-medium">Certificate URL</label>
                    <Input
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
          {/* ---------------------- SUBMIT ---------------------- */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              onClick={async (e) => {
                e.preventDefault();
                if (!validate()) return;

                if (!profileImage) {
                  setProfileImageError('Profile image is required');
                  return;
                }

                // 1. Prepare the Plain Object Payload
                // Note: We cast to 'any' momentarily to attach the profile_image
                // because strict types might not have profile_image in the Payload type yet.
                const payload: any = {
                  headline,
                  location,
                  about,
                  preferred_field: preferredField || undefined,
                  looking_for: [lookingFor],
                  linkedin_url: linkedinUrl || undefined,
                  github_url: githubUrl || undefined,
                  resume_link: resumeLink || undefined,
                  skills: selectedSkillIds.length ? selectedSkillIds : undefined,

                  // Attach the file here
                  profile_image: profileImage,

                  education: educationList
                    .filter((e) => e.institute && e.courseId && e.from_date && e.to_date)
                    .map((edu) => ({
                      institute: edu.institute,
                      from_date: edu.from_date,
                      to_date: edu.to_date,
                      course: edu.courseId, // Send ID
                      specialization: edu.specialization || undefined,
                    })),

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

                // 2. Pass the OBJECT to the redux action/API.
                // DO NOT use new FormData() here.
                const res = await dispatch(createStudentProfile(payload));

                if (createStudentProfile.fulfilled.match(res)) {
                  navigate('/profiles');
                }
              }}
            >
              {loading ? 'Saving…' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateProfile;
