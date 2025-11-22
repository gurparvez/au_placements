// StudentProfilePageEditable.validated.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Edit2, Plus, Trash2, X, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader as DialogHeaderUI,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type Experience = { id: string; title: string; org: string; period: string; bullets: string[] };
type Project = { id: string; title: string; tech: string; description?: string };

const STUDENT_ID = 'student123';
const MAX_CV_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const StudentProfile: React.FC = () => {
  // top inline edit toggles
  const [editingName, setEditingName] = useState(false);
  const [editingHeadline, setEditingHeadline] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);

  // data state
  const [name, setName] = useState('Mukesh Chaudhary');
  const [headline, setHeadline] = useState(
    'Computer Science student • Aspiring Software Developer'
  );
  const [location, setLocation] = useState('Himachal Pradesh');
  const [bio, setBio] = useState(
    'Passionate Computer Science student with experience in building applications using C++, React, and Node.js.'
  );
  const [editingAbout, setEditingAbout] = useState(false);

  const [contact, setContact] = useState({ mobile: '', email: '', linkedin: '', github: '' });
  const [editingContact, setEditingContact] = useState(false);

  const [cvFile, setCvFile] = useState<File | null>(null);

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: 'e1',
      title: 'Software Developer Intern',
      org: 'Akal University',
      period: '2023 - 2024',
      bullets: [
        'Worked on full-stack project development.',
        'Created components and UI for student placement portal.',
      ],
    },
  ]);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'p1',
      title: 'AU Placement Portal',
      tech: 'React, TypeScript, Firebase',
      description: 'Placement portal to manage student-company interactions.',
    },
    {
      id: 'p2',
      title: 'Akal Study App',
      tech: 'Flutter, Firebase',
      description: 'Notes-sharing platform for students and teachers.',
    },
  ]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const [skills, setSkills] = useState<string[]>(['C++', 'React', 'Node.js', 'Python']);
  const [newSkill, setNewSkill] = useState('');

  const [education, setEducation] = useState({
    school: 'Akal University',
    degree: 'BTech CSE',
    period: '2021 - 2025',
  });
  const [editingEducation, setEditingEducation] = useState(false);

  // validation state
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [saving, setSaving] = useState(false);

  function addExperience() {
    const id = `e${Date.now()}`;
    setExperiences((prev) => [
      ...prev,
      { id, title: 'New Role', org: 'Org', period: '', bullets: [''] },
    ]);
    setEditingExperienceId(id);
  }
  function removeExperience(id: string) {
    setExperiences((p) => p.filter((x) => x.id !== id));
  }
  function saveExperience(updated: Experience) {
    setExperiences((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditingExperienceId(null);
  }

  function addProject() {
    if (!newProjectTitle.trim()) return;
    const id = `p${Date.now()}`;
    setProjects((p) => [
      ...p,
      {
        id,
        title: newProjectTitle.trim(),
        tech: newProjectTech.trim(),
        description: newProjectDesc.trim(),
      },
    ]);
    setNewProjectTitle('');
    setNewProjectTech('');
    setNewProjectDesc('');
  }
  function saveProject(id: string, updated: Project) {
    setProjects((p) => p.map((pr) => (pr.id === id ? updated : pr)));
    setEditingProjectId(null);
  }
  function removeProject(id: string) {
    setProjects((p) => p.filter((pr) => pr.id !== id));
  }

  function addSkill() {
    const s = newSkill.trim();
    if (!s) return;
    if (!skills.includes(s)) setSkills((p) => [...p, s]);
    setNewSkill('');
  }
  function removeSkill(skillToRemove: string) {
    setSkills((p) => p.filter((s) => s !== skillToRemove));
  }

  // CV handling + client-side validation
  function handleCvChange(file?: File) {
    setErrors((prev) => ({ ...prev, cv: '' }));
    if (!file) return setCvFile(null);

    if (!ALLOWED_CV_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, cv: 'Only PDF / DOC / DOCX allowed' }));
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setErrors((prev) => ({ ...prev, cv: `CV must be <= ${MAX_CV_BYTES / (1024 * 1024)} MB` }));
      return;
    }
    setCvFile(file);
  }

  // basic frontend validation
  function validateAll() {
    const e: { [k: string]: string } = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!contact.email.trim()) e.email = 'Email is required';
    else {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(contact.email.trim())) e.email = 'Invalid email';
    }
    if (cvFile) {
      if (!ALLOWED_CV_TYPES.includes(cvFile.type)) e.cv = 'CV must be PDF/DOC/DOCX';
      if (cvFile.size > MAX_CV_BYTES) e.cv = `CV must be <= ${MAX_CV_BYTES / (1024 * 1024)} MB`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // prepare data to send (cleanup bullets, trim strings)
  function preparePayload() {
    const cleanedExperiences = experiences.map((ex) => ({
      ...ex,
      bullets: ex.bullets.map((b) => b.trim()).filter(Boolean),
    }));
    const cleanedProjects = projects.map((pr) => ({
      ...pr,
      title: pr.title.trim(),
      tech: pr.tech.trim(),
      description: (pr.description || '').trim(),
    }));
    return {
      name: name.trim(),
      headline: headline.trim(),
      location: location.trim(),
      bio: bio.trim(),
      contact: {
        ...contact,
        mobile: contact.mobile.trim(),
        email: contact.email.trim(),
        linkedin: contact.linkedin.trim(),
        github: contact.github.trim(),
      },
      experiences: cleanedExperiences,
      projects: cleanedProjects,
      skills: skills.map((s) => s.trim()).filter(Boolean),
      education,
    };
  }

  // Save All
  async function handleSaveAll() {
    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const url = `/api/students/${STUDENT_ID}`;
      const form = new FormData();

      const payload = preparePayload();
      form.append('name', payload.name);
      form.append('headline', payload.headline);
      form.append('location', payload.location);
      form.append('bio', payload.bio);
      form.append('contact', JSON.stringify(payload.contact));
      form.append('experiences', JSON.stringify(payload.experiences));
      form.append('projects', JSON.stringify(payload.projects));
      form.append('skills', JSON.stringify(payload.skills));
      form.append('education', JSON.stringify(payload.education));

      if (cvFile) form.append('cv', cvFile);

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { method: 'POST', body: form, headers });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Save failed');
      }
      await res.json();
      alert('Saved successfully');
    } catch (err: any) {
      console.error(err);
      alert('Error saving: ' + (err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  // JSX
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <div className="bg-muted h-48 w-full rounded-md" />

      <Card className="relative z-10 -mt-20">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="-mt-12">
              <Avatar className="border-background h-28 w-28 border-4">
                <AvatarImage src="/profile.jpg" />
                <AvatarFallback>ST</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <div>
                  {/* Name inline */}
                  <div className="flex items-center gap-3">
                    {!editingName ? (
                      <>
                        <h1 className="text-2xl font-semibold">{name}</h1>
                        <Button size="sm" variant="ghost" onClick={() => setEditingName(true)}>
                          <Edit2 />
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                        <Button size="sm" onClick={() => setEditingName(false)}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}

                  {/* Headline inline */}
                  <div className="mt-1 flex items-center gap-2">
                    {!editingHeadline ? (
                      <>
                        <p className="text-muted-foreground text-sm">{headline}</p>
                        <Button size="sm" variant="ghost" onClick={() => setEditingHeadline(true)}>
                          <Edit2 />
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
                        <Button size="sm" onClick={() => setEditingHeadline(false)}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingHeadline(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Location inline */}
                  <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                    {!editingLocation ? (
                      <>
                        <MapPin className="h-4 w-4" />
                        <span>{location}</span>
                        <Button size="sm" variant="ghost" onClick={() => setEditingLocation(true)}>
                          <Edit2 />
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                        <Button size="sm" onClick={() => setEditingLocation(false)}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingLocation(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary">
                    Message
                  </Button>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-3">
                {!editingAbout ? (
                  <div className="flex items-start gap-3">
                    <p className="text-muted-foreground text-sm">{bio}</p>
                    <Button size="sm" variant="ghost" onClick={() => setEditingAbout(true)}>
                      <Edit2 className="mr-2" /> Edit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
                    <div className="flex gap-2">
                      <Button onClick={() => setEditingAbout(false)}>Save</Button>
                      <Button variant="ghost" onClick={() => setEditingAbout(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Contact Info</h2>
          <div>
            {!editingContact ? (
              <Button size="sm" variant="ghost" onClick={() => setEditingContact(true)}>
                <Edit2 />
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setEditingContact(false)}>
                <X />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!editingContact ? (
            <div className="text-muted-foreground space-y-2 text-sm">
              <div>Mobile: {contact.mobile || '—'}</div>
              <div>Email: {contact.email || '—'}</div>
              <div>LinkedIn: {contact.linkedin || '—'}</div>
              <div>GitHub: {contact.github || '—'}</div>
              <div className="mt-3">
                <label className="text-sm">CV: </label>
                <div className="text-muted-foreground text-sm">
                  {cvFile ? cvFile.name : 'No CV uploaded'}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Mobile number"
                value={contact.mobile}
                onChange={(e) => setContact((p) => ({ ...p, mobile: e.target.value }))}
              />
              <Input
                placeholder="Email"
                value={contact.email}
                onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
              />
              {errors.email && <div className="text-sm text-red-600">{errors.email}</div>}
              <Input
                placeholder="LinkedIn profile URL"
                value={contact.linkedin}
                onChange={(e) => setContact((p) => ({ ...p, linkedin: e.target.value }))}
              />
              <Input
                placeholder="GitHub profile URL"
                value={contact.github}
                onChange={(e) => setContact((p) => ({ ...p, github: e.target.value }))}
              />

              <div className="flex items-center gap-2">
                <input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleCvChange(e.target.files ? e.target.files[0] : undefined)}
                  className="hidden"
                />
                <label htmlFor="cv-upload">
                  <Button variant="outline" asChild>
                    <span className="flex items-center gap-2">
                      <Upload /> Upload CV
                    </span>
                  </Button>
                </label>
                {cvFile && <div className="text-muted-foreground text-sm">{cvFile.name}</div>}
              </div>
              {errors.cv && <div className="text-sm text-red-600">{errors.cv}</div>}

              <div className="mt-2 flex gap-2">
                <Button
                  onClick={() => {
                    if (!contact.email.trim())
                      setErrors((e) => ({ ...e, email: 'Email is required' }));
                    else setEditingContact(false);
                  }}
                >
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setEditingContact(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Experience</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={addExperience}>
              <Plus className="mr-2" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="bg-muted rounded-md p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{exp.title}</h3>
                    <span className="text-muted-foreground text-sm">{exp.org}</span>
                    <span className="text-muted-foreground text-sm">{exp.period}</span>
                  </div>
                  <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
                    {exp.bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingExperienceId(exp.id)}
                    >
                      <Edit2 />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeExperience(exp.id)}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Experience Edit Modal */}
              <Dialog
                open={editingExperienceId === exp.id}
                onOpenChange={(open) => {
                  if (!open) setEditingExperienceId(null);
                }}
              >
                <DialogContent>
                  <DialogHeaderUI>
                    <DialogTitle>Edit Experience</DialogTitle>
                  </DialogHeaderUI>
                  <div className="mt-2 space-y-2">
                    <Input
                      value={exp.title}
                      onChange={(e) =>
                        setExperiences((prev) =>
                          prev.map((x) => (x.id === exp.id ? { ...x, title: e.target.value } : x))
                        )
                      }
                      placeholder="Job Title"
                    />
                    <Input
                      value={exp.org}
                      onChange={(e) =>
                        setExperiences((prev) =>
                          prev.map((x) => (x.id === exp.id ? { ...x, org: e.target.value } : x))
                        )
                      }
                      placeholder="Organization"
                    />
                    <Input
                      value={exp.period}
                      onChange={(e) =>
                        setExperiences((prev) =>
                          prev.map((x) => (x.id === exp.id ? { ...x, period: e.target.value } : x))
                        )
                      }
                      placeholder="Period (e.g. 2023 - 2024)"
                    />
                    <Textarea
                      value={exp.bullets.join('\n')}
                      onChange={(e) =>
                        setExperiences((prev) =>
                          prev.map((x) =>
                            x.id === exp.id
                              ? {
                                  ...x,
                                  bullets: e.target.value
                                    .split('\n')
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                }
                              : x
                          )
                        )
                      }
                      placeholder="One bullet per line"
                    />
                  </div>
                  <DialogFooter className="mt-4 flex justify-end gap-2">
                    <Button onClick={() => saveExperience(exp)}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditingExperienceId(null)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              placeholder="Project title"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
            />
            <Input
              placeholder="Tech stack"
              value={newProjectTech}
              onChange={(e) => setNewProjectTech(e.target.value)}
            />
            <Input
              placeholder="Short description (optional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
            />
            <Button onClick={addProject}>
              <Plus />
            </Button>
          </div>

          <div className="space-y-2">
            {projects.map((pr) => (
              <div
                key={pr.id}
                className="bg-muted flex flex-col items-start justify-between gap-3 rounded-md p-3 md:flex-row"
              >
                <div className="flex-1">
                  <div className="font-medium">{pr.title}</div>
                  <div className="text-muted-foreground text-sm">{pr.tech}</div>
                  {pr.description && (
                    <div className="text-muted-foreground mt-2 text-sm">{pr.description}</div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingProjectId(pr.id)}>
                      <Edit2 />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeProject(pr.id)}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                {/* Project Edit Modal */}
                <Dialog
                  open={editingProjectId === pr.id}
                  onOpenChange={(open) => {
                    if (!open) setEditingProjectId(null);
                  }}
                >
                  <DialogContent>
                    <DialogHeaderUI>
                      <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeaderUI>
                    <div className="mt-2 space-y-2">
                      <Input
                        value={pr.title}
                        onChange={(e) =>
                          setProjects((p) =>
                            p.map((x) => (x.id === pr.id ? { ...x, title: e.target.value } : x))
                          )
                        }
                        placeholder="Project title"
                      />
                      <Input
                        value={pr.tech}
                        onChange={(e) =>
                          setProjects((p) =>
                            p.map((x) => (x.id === pr.id ? { ...x, tech: e.target.value } : x))
                          )
                        }
                        placeholder="Tech stack"
                      />
                      <Textarea
                        value={pr.description ?? ''}
                        onChange={(e) =>
                          setProjects((p) =>
                            p.map((x) =>
                              x.id === pr.id ? { ...x, description: e.target.value } : x
                            )
                          )
                        }
                        placeholder="Detailed project description"
                      />
                    </div>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                      <Button onClick={() => saveProject(pr.id, pr)}>Save</Button>
                      <Button variant="ghost" onClick={() => setEditingProjectId(null)}>
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Skills</h2>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <div key={s} className="bg-muted flex items-center gap-2 rounded-full px-3 py-1">
                <span className="text-sm">{s}</span>
                <button onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <Button onClick={addSkill}>
              <Plus />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Education</h2>
          <div>
            {!editingEducation ? (
              <Button size="sm" variant="ghost" onClick={() => setEditingEducation(true)}>
                <Edit2 />
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setEditingEducation(false)}>
                <X />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!editingEducation ? (
            <div>
              <div className="font-medium">{education.school}</div>
              <div className="text-muted-foreground text-sm">
                {education.degree} • {education.period}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                value={education.school}
                onChange={(e) => setEducation((p) => ({ ...p, school: e.target.value }))}
              />
              <Input
                value={education.degree}
                onChange={(e) => setEducation((p) => ({ ...p, degree: e.target.value }))}
              />
              <Input
                value={education.period}
                onChange={(e) => setEducation((p) => ({ ...p, period: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button onClick={() => setEditingEducation(false)}>Save</Button>
                <Button variant="ghost" onClick={() => setEditingEducation(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button onClick={handleSaveAll} disabled={saving || Object.keys(errors).length > 0}>
          {saving ? 'Saving...' : 'Save All'}
        </Button>
      </div>
    </div>
  );
};

export default StudentProfile;
