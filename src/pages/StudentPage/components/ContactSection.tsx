import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Github, Linkedin, FileText, ExternalLink } from 'lucide-react';

const ContactSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.student);

  // Local state for form fields
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [resume, setResume] = useState('');

  // Edit mode toggle
  const [isEditing, setIsEditing] = useState(false);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setLinkedin(profile.linkedin_url || '');
      setGithub(profile.github_url || '');
      setResume(profile.resume_link || '');
    }
  }, [profile]);

  if (!profile) return null;

  const handleSave = () => {
    const payload: any = {};

    // Only add to payload if changed
    if (linkedin !== profile.linkedin_url) payload.linkedin_url = linkedin;
    if (github !== profile.github_url) payload.github_url = github;
    if (resume !== profile.resume_link) payload.resume_link = resume;

    // Dispatch if there are changes (optional optimization) or just dispatch
    dispatch(updateStudentProfile(payload));
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset fields to original values
    setLinkedin(profile.linkedin_url || '');
    setGithub(profile.github_url || '');
    setResume(profile.resume_link || '');
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-lg font-semibold">Contact Info</h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* LinkedIn */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Linkedin className="h-4 w-4 text-blue-600" />
            LinkedIn
          </div>
          {isEditing ? (
            <Input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          ) : (
            <div className="text-muted-foreground truncate text-sm">
              {profile.linkedin_url ? (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1 hover:underline"
                >
                  {profile.linkedin_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                '—'
              )}
            </div>
          )}
        </div>

        {/* GitHub */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Github className="h-4 w-4" />
            GitHub
          </div>
          {isEditing ? (
            <Input
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/..."
            />
          ) : (
            <div className="text-muted-foreground truncate text-sm">
              {profile.github_url ? (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1 hover:underline"
                >
                  {profile.github_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                '—'
              )}
            </div>
          )}
        </div>

        {/* Resume */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-orange-500" />
            Resume Link
          </div>
          {isEditing ? (
            <Input
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
          ) : (
            <div className="text-muted-foreground truncate text-sm">
              {profile.resume_link ? (
                <a
                  href={profile.resume_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1 hover:underline"
                >
                  View Resume
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                '—'
              )}
            </div>
          )}
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactSection;
