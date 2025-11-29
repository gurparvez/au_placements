import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Github, Linkedin, FileText, ExternalLink, Upload, X } from 'lucide-react';

const ContactSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.student);

  // Local state for form fields
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  
  // Resume State
  const [resumeLink, setResumeLink] = useState(''); // Stores existing URL
  const [resumeFile, setResumeFile] = useState<File | null>(null); // Stores new file
  const [resumeError, setResumeError] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Edit mode toggle
  const [isEditing, setIsEditing] = useState(false);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setLinkedin(profile.linkedin_url || '');
      setGithub(profile.github_url || '');
      setResumeLink(profile.resume_link || '');
    }
  }, [profile]);

  if (!profile) return null;

  // --- File Handler ---
  const handleResumeChange = (file?: File) => {
    setResumeError(null);

    if (!file) {
      setResumeFile(null);
      return;
    }

    // Validate type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      setResumeError('Only PDF or Word documents are allowed.');
      return;
    }

    // Max size 5MB
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('Resume must be 5MB or smaller.');
      return;
    }

    setResumeFile(file);
  };

  const handleSave = async () => {
    const payload: any = {};

    // Only add text fields if changed
    if (linkedin !== profile.linkedin_url) payload.linkedin_url = linkedin;
    if (github !== profile.github_url) payload.github_url = github;

    // Add resume file if a NEW file is selected
    // Note: The backend expects the key 'resume' for the file object
    if (resumeFile) {
        payload.resume = resumeFile;
    }

    // Dispatch if there are changes
    if (Object.keys(payload).length > 0) {
        await dispatch(updateStudentProfile(payload));
    }
    
    // Reset local file state after save
    setResumeFile(null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset fields to original values
    setLinkedin(profile.linkedin_url || '');
    setGithub(profile.github_url || '');
    setResumeLink(profile.resume_link || '');
    
    // Clear new file selection
    setResumeFile(null);
    setResumeError(null);
    
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
            Resume
          </div>

          {isEditing ? (
            <div className="space-y-2">
                {/* 1. Show existing link if no new file is selected */}
                {!resumeFile && resumeLink && (
                     <div className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
                        <span>Current:</span>
                        <a href={resumeLink} target="_blank" rel="noreferrer" className="underline truncate max-w-[200px]">
                            View Resume
                        </a>
                     </div>
                )}

                {/* 2. File Input UI */}
                <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleResumeChange(e.target.files?.[0])}
                />

                <div className="flex items-center gap-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => resumeInputRef.current?.click()}
                    >
                        <Upload className="mr-2 h-3 w-3" />
                        {resumeLink || resumeFile ? 'Change Resume' : 'Upload Resume'}
                    </Button>

                    {resumeFile && (
                        <div className="flex items-center gap-2 text-sm bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                             <span className="truncate max-w-[120px]">{resumeFile.name}</span>
                             <button onClick={() => setResumeFile(null)} className="hover:text-green-900">
                                <X className="h-3 w-3" />
                             </button>
                        </div>
                    )}
                </div>
                
                {resumeError && <p className="text-xs text-red-500">{resumeError}</p>}
            </div>
          ) : (
            // READ ONLY VIEW
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
