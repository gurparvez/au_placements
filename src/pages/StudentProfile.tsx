import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchAnyStudentProfile } from '@/context/student/studentSlice';
import skillsApi from '@/api/skills';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'; // 🟢 Added Badge
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  FileText,
  Globe,
  CalendarDays, // 🟢 Added Calendar Icon
} from 'lucide-react';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';

// 🟢 Helper to format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

const PublicStudentProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userId } = useParams();

  const { publicProfile, loading, error } = useAppSelector((s) => s.student);

  const [resolvedProjects, setResolvedProjects] = useState<any[] | null>(null);

  const getMailToLink = (email: string, firstName: string, lastName: string) => {
    if (!email) return '#';

    const fullName = `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName)}`;
    const subject = `Opportunity via AU Placements`;

    const body = `Hi ${fullName},

I reviewed your profile on AU Placements and was impressed by your skills and projects.

We would like to move forward with your profile for a role at [Insert Company Name]. 

Please let us know your availability for an initial discussion.

Best regards,
[Recruiter Name]
[Company Name]`;

    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // -------------------------------------------------------------------
  // Fetch public profile
  // -------------------------------------------------------------------
  useEffect(() => {
    if (userId) dispatch(fetchAnyStudentProfile({ userId }));
  }, [userId, dispatch]);

  // -------------------------------------------------------------------
  // Fetch skill names for project.tech_used
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!publicProfile) return;

    async function resolveSkills() {
      const projects = publicProfile?.projects || [];

      const enhancedProjects = await Promise.all(
        projects.map(async (project) => {
          if (!project.tech_used || project.tech_used.length === 0) {
            return { ...project, tech_used_resolved: [] };
          }

          const resolvedSkills = await Promise.all(
            project.tech_used.map(async (id: string) => {
              try {
                const { skill } = await skillsApi.getSkillById(id);
                return skill;
              } catch (err) {
                console.error('Failed to fetch skill:', id);
                return null;
              }
            })
          );

          return {
            ...project,
            tech_used_resolved: resolvedSkills.filter(Boolean),
          };
        })
      );

      setResolvedProjects(enhancedProjects);
    }

    resolveSkills();
  }, [publicProfile]);

  // -------------------------------------------------------------------
  // Render states
  // -------------------------------------------------------------------
  if (!userId)
    return (
      <div className="mt-10 p-10 text-center text-xl text-red-500">Missing userId in URL.</div>
    );

  if (loading) return <div className="mt-10 p-10 text-center text-lg">Loading…</div>;

  if (error)
    return <div className="mt-10 p-10 text-center text-lg text-red-500">Error: {error}</div>;

  if (!publicProfile)
    return <div className="mt-10 p-10 text-center text-lg text-red-500">Profile not found.</div>;

  const profile = publicProfile;
  const user = profile.user as any;

  // Prepare Looking For Data
  const lookingFor = profile.looking_for;
  const fromDate = formatDate(lookingFor?.from_date);
  const toDate = formatDate(lookingFor?.to_date);

  // -------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      {/* Banner */}
      <div className="bg-muted h-48 w-full rounded-md"></div>

      {/* Profile Hero */}
      <Card className="relative z-10">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            {/* Avatar */}
            <div>
              <Avatar className="border-background h-28 w-28 overflow-hidden border-4">
                <AvatarImage
                  src={profile.profile_image || '/avatar-placeholder.png'}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback>{user.firstName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold capitalize">
                {user.firstName} {user.lastName}
              </h1>

              <p className="text-muted-foreground mt-1 text-sm">{profile.headline}</p>

              <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>

              {/* 🟢 NEW: Looking For Section */}
              {lookingFor && lookingFor.type && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="px-3 text-sm font-medium capitalize">
                    Open to {lookingFor.type}
                  </Badge>

                  {fromDate && (
                    <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        Available: {fromDate}
                        {toDate ? ` - ${toDate}` : ' onwards'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-muted-foreground mt-4 text-sm whitespace-pre-wrap">
                {profile.about}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Contact Info</h2>
        </CardHeader>
        <CardContent className="text-muted-foreground grid gap-4 text-sm sm:grid-cols-2">
          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="text-primary h-4 w-4" />
            {user.email ? (
              <a
                href={getMailToLink(user.email, user.firstName, user.lastName)}
                className="text-foreground hover:text-primary truncate hover:underline"
                title="Send email with template"
              >
                {user.email}
              </a>
            ) : (
              <span>—</span>
            )}
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <Phone className="text-primary h-4 w-4" />
            <span>{user.phone || '—'}</span>
          </div>

          {/* LinkedIn */}
          <div className="flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-blue-600" />
            {profile.linkedin_url ? (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary truncate hover:underline"
              >
                {profile.linkedin_url}
              </a>
            ) : (
              '—'
            )}
          </div>

          {/* GitHub */}
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            {profile.github_url ? (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary truncate hover:underline"
              >
                {profile.github_url}
              </a>
            ) : (
              '—'
            )}
          </div>

          {/* Resume */}
          <div className="flex items-center gap-2 sm:col-span-2">
            <FileText className="h-4 w-4 text-orange-500" />
            {profile.resume_link ? (
              <a
                href={profile.resume_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary hover:underline"
              >
                View Resume
              </a>
            ) : (
              '—'
            )}
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Experience</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.experience.length === 0 && (
            <p className="text-muted-foreground text-sm">No experience added.</p>
          )}

          {profile.experience.map((exp) => (
            <div key={exp._id} className="bg-muted rounded-md p-4">
              <h3 className="font-medium">{exp.role}</h3>
              <p className="text-muted-foreground text-sm">{exp.company}</p>
              <p className="text-muted-foreground text-sm">
                {new Date(exp.start_date).getFullYear()} -{' '}
                {exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}
              </p>

              {exp.description && (
                <p className="text-muted-foreground mt-2 text-sm">{exp.description}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Projects</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {!resolvedProjects && (
            <p className="text-muted-foreground text-sm">Loading project skills…</p>
          )}

          {resolvedProjects &&
            resolvedProjects.map((pr) => (
              <div
                key={pr._id}
                className="bg-muted border-border/50 space-y-2 rounded-md border p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{pr.title}</div>
                  </div>

                  <div className="flex gap-3">
                    {pr.code_url && (
                      <a
                        href={pr.code_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="View Code"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {pr.live_url && (
                      <a
                        href={pr.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="View Live Site"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {pr.description && (
                  <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {pr.description}
                  </div>
                )}

                {/* Resolved Skills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {pr.tech_used_resolved?.map(
                    (skill: { _id: React.Key | null | undefined; displayName: any; name: any }) => (
                      <div
                        key={skill._id}
                        className="bg-background border-input rounded-full border px-3 py-1 text-xs"
                      >
                        {skill.displayName || skill.name}
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Skills</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {profile.skills.map((s) => (
            <div
              key={s._id}
              className="bg-muted text-foreground rounded-full px-3 py-1 text-sm font-medium"
            >
              {s.displayName || s.name}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Education</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.education.map((edu) => (
            <div key={edu._id} className="border-primary border-l-2 pl-4">
              <div className="font-medium">{edu.institute}</div>
              <div className="text-muted-foreground text-sm">
                {edu.course?.name} • {new Date(edu.from_date).getFullYear()}–
                {new Date(edu.to_date).getFullYear()}
              </div>

              {edu.specialization && (
                <div className="text-muted-foreground text-sm">
                  Specialization: {edu.specialization}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />
    </div>
  );
};

export default PublicStudentProfile;
