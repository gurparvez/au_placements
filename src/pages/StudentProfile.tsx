import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchAnyStudentProfile } from '@/context/student/studentSlice';
import skillsApi from '@/api/skills'; // ⬅ new import

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MapPin } from 'lucide-react';

const PublicStudentProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userId } = useParams();

  const { publicProfile, loading, error } = useAppSelector((s) => s.student);

  const [resolvedProjects, setResolvedProjects] = useState<any[] | null>(null);

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

      // For each project, fetch all skills by ID
      const enhancedProjects = await Promise.all(
        projects.map(async (project) => {
          if (!project.tech_used || project.tech_used.length === 0) {
            return { ...project, tech_used_resolved: [] };
          }

          // Fetch skill details in parallel
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

  // -------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      {/* Banner */}
      <div className="bg-muted h-48 w-full rounded-md"></div>

      {/* Profile Hero */}
      <Card className="relative z-10 -mt-20">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="-mt-12">
              <Avatar className="border-background h-28 w-28 overflow-hidden border-4">
                <AvatarImage
                  src={profile.profile_image || '/avatar-placeholder.png'}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback>{profile.user.firstName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{profile.user.firstName}</h1>

              <p className="text-muted-foreground mt-1 text-sm">{profile.headline}</p>

              <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>

              <div className="text-muted-foreground mt-3 text-sm">{profile.about}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Contact Info</h2>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <div>
            LinkedIn:{' '}
            {profile.linkedin_url ? (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {profile.linkedin_url}
              </a>
            ) : (
              '—'
            )}
          </div>

          <div>
            GitHub:{' '}
            {profile.github_url ? (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {profile.github_url}
              </a>
            ) : (
              '—'
            )}
          </div>

          <div>
            Resume:{' '}
            {profile.resume_link ? (
              <a
                href={profile.resume_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
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
                {new Date(exp.start_date).getFullYear()} –{' '}
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
              <div key={pr._id} className="bg-muted space-y-2 rounded-md p-3">
                <div className="font-medium">{pr.title}</div>

                {pr.description && (
                  <div className="text-muted-foreground text-sm">{pr.description}</div>
                )}

                {/* Resolved Skills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {pr.tech_used_resolved?.map(
                    (skill: { _id: React.Key | null | undefined; displayName: any; name: any }) => (
                      <div
                        key={skill._id}
                        className="bg-muted rounded-full border px-3 py-1 text-sm"
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
            <div key={s._id} className="bg-muted rounded-full px-3 py-1 text-sm">
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
            <div key={edu._id}>
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
