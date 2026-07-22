import React, { useEffect, useRef, useState } from 'react';
import { Mail, Phone, Linkedin, Github, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import { updateUserDetails } from '@/context/auth/authSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SectionCard from './SectionCard';

const RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ContactSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.student);
  const { user } = useAppSelector((s) => s.auth);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Hydrate fields each time the dialog opens
  useEffect(() => {
    if (!open) return;
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setLinkedin(profile?.linkedin_url || '');
    setGithub(profile?.github_url || '');
    setResumeFile(null);
  }, [open, profile, user]);

  if (!profile) return null;

  const handleResumeChange = (file?: File) => {
    if (!file) {
      setResumeFile(null);
      return;
    }
    if (!RESUME_TYPES.includes(file.type)) {
      toast.error('Only PDF or Word documents are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Résumé must be 5MB or smaller.');
      return;
    }
    setResumeFile(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      // 1. Account contact (auth slice) — keep names intact
      if (email !== (user?.email || '') || phone !== (user?.phone || '')) {
        await dispatch(
          updateUserDetails({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email,
            phone,
          })
        ).unwrap();
      }

      // 2. Profile links + résumé (student slice)
      await dispatch(
        updateStudentProfile({
          linkedin_url: linkedin,
          github_url: github,
          ...(resumeFile ? { resume: resumeFile } : {}),
        })
      ).unwrap();

      toast.success('Contact info updated');
      setOpen(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const linkRowClass =
    'hover:text-primary flex min-w-0 items-center gap-1 truncate hover:underline';

  return (
    <>
      <SectionCard title="Contact & links" onEdit={() => setOpen(true)} isEmpty={false}>
        <ul className="divide-y divide-border text-sm">
          {/* Email */}
          <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="bg-surface-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Mail className="text-muted-foreground h-4 w-4" aria-hidden />
            </span>
            {user?.email ? (
              <a href={`mailto:${user.email}`} className={linkRowClass}>
                <span className="truncate">{user.email}</span>
              </a>
            ) : (
              <span className="text-text-subtle italic">Not added</span>
            )}
          </li>

          {/* Phone */}
          <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="bg-surface-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Phone className="text-muted-foreground h-4 w-4" aria-hidden />
            </span>
            {user?.phone ? (
              <a href={`tel:${user.phone}`} className={linkRowClass}>
                <span className="truncate">{user.phone}</span>
              </a>
            ) : (
              <span className="text-text-subtle italic">Not added</span>
            )}
          </li>

          {/* LinkedIn */}
          <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="bg-surface-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Linkedin className="text-muted-foreground h-4 w-4" aria-hidden />
            </span>
            {profile.linkedin_url ? (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkRowClass}
              >
                <span className="truncate">{profile.linkedin_url}</span>
              </a>
            ) : (
              <span className="text-text-subtle italic">Not added</span>
            )}
          </li>

          {/* GitHub */}
          <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="bg-surface-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Github className="text-muted-foreground h-4 w-4" aria-hidden />
            </span>
            {profile.github_url ? (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkRowClass}
              >
                <span className="truncate">{profile.github_url}</span>
              </a>
            ) : (
              <span className="text-text-subtle italic">Not added</span>
            )}
          </li>

          {/* Résumé */}
          <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="bg-surface-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <FileText className="text-muted-foreground h-4 w-4" aria-hidden />
            </span>
            {profile.resume_link ? (
              <a
                href={profile.resume_link}
                target="_blank"
                rel="noopener noreferrer"
                className={linkRowClass}
              >
                <span className="truncate">View résumé</span>
              </a>
            ) : (
              <span className="text-text-subtle italic">Not added</span>
            )}
          </li>
        </ul>
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display">Edit contact &amp; links</DialogTitle>
            <DialogDescription>How recruiters can reach you and find your work.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-linkedin" className="mb-1.5 block text-sm font-medium">
                  LinkedIn URL
                </label>
                <Input
                  id="contact-linkedin"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/…"
                />
              </div>
              <div>
                <label htmlFor="contact-github" className="mb-1.5 block text-sm font-medium">
                  GitHub URL
                </label>
                <Input
                  id="contact-github"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/…"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-resume" className="mb-1.5 block text-sm font-medium">
                Résumé
              </label>
              <input
                ref={resumeInputRef}
                id="contact-resume"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleResumeChange(e.target.files?.[0])}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => resumeInputRef.current?.click()}
                >
                  <FileText className="mr-1 h-4 w-4" aria-hidden />
                  Choose file
                </Button>
                <span className="text-muted-foreground min-w-0 truncate text-sm">
                  {resumeFile
                    ? resumeFile.name
                    : profile.resume_link
                      ? 'Current résumé on file'
                      : 'No file selected'}
                </span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-xs">PDF or Word, up to 5MB.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden /> Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactSection;
