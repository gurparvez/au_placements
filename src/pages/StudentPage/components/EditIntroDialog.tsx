import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { Textarea } from '@/components/ui/textarea';

import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import { updateUserDetails } from '@/context/auth/authSlice';

interface EditIntroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toInputDate = (d?: string) => (d ? new Date(d).toISOString().split('T')[0] : '');

const Field: React.FC<{ id: string; label: string; children: React.ReactNode }> = ({
  id,
  label,
  children,
}) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
      {label}
    </label>
    {children}
  </div>
);

const EditIntroDialog: React.FC<EditIntroDialogProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.student);
  const { user } = useAppSelector((s) => s.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [preferredField, setPreferredField] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [lfType, setLfType] = useState<'internship' | 'job'>('internship');
  const [lfFrom, setLfFrom] = useState('');
  const [lfTo, setLfTo] = useState('');
  const [saving, setSaving] = useState(false);

  // Hydrate fields each time the dialog opens
  useEffect(() => {
    if (!open) return;
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setHeadline(profile?.headline || '');
    setLocation(profile?.location || '');
    setAbout(profile?.about || '');
    setPreferredField(profile?.preferred_field || '');
    setLinkedin(profile?.linkedin_url || '');
    setGithub(profile?.github_url || '');
    setLfType(profile?.looking_for?.type || 'internship');
    setLfFrom(toInputDate(profile?.looking_for?.from_date));
    setLfTo(toInputDate(profile?.looking_for?.to_date));
  }, [open, profile, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Account name (auth slice) — keep email/phone intact
      if (firstName !== user?.firstName || lastName !== user?.lastName) {
        await dispatch(
          updateUserDetails({
            firstName,
            lastName,
            email: user?.email,
            phone: user?.phone,
          })
        ).unwrap();
      }

      // 2. Profile intro fields (student slice)
      await dispatch(
        updateStudentProfile({
          headline,
          location,
          about,
          preferred_field: preferredField,
          linkedin_url: linkedin,
          github_url: github,
          looking_for: {
            type: lfType,
            from_date: lfFrom || undefined,
            to_date: lfTo || undefined,
          },
        })
      ).unwrap();

      toast.success('Profile updated');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit intro</DialogTitle>
          <DialogDescription>This is the first thing recruiters see.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="intro-first" label="First name">
              <Input id="intro-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Field>
            <Field id="intro-last" label="Last name">
              <Input id="intro-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Field>
          </div>

          <Field id="intro-headline" label="Headline">
            <Input
              id="intro-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Full-stack developer · B.Tech CSE '26"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="intro-location" label="Location">
              <Input
                id="intro-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bathinda, Punjab"
              />
            </Field>
            <Field id="intro-field" label="Preferred field">
              <Input
                id="intro-field"
                value={preferredField}
                onChange={(e) => setPreferredField(e.target.value)}
                placeholder="Software Engineering"
              />
            </Field>
          </div>

          <Field id="intro-about" label="About">
            <Textarea
              id="intro-about"
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="A short summary of who you are and what you're looking for."
            />
          </Field>

          {/* Availability */}
          <div className="bg-bg-2 rounded-lg border border-border p-4">
            <span className="eyebrow">Open to</span>
            <div className="mt-3 flex flex-wrap gap-6 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="lf-type"
                  className="accent-primary h-4 w-4"
                  checked={lfType === 'internship'}
                  onChange={() => setLfType('internship')}
                />
                Internship
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="lf-type"
                  className="accent-primary h-4 w-4"
                  checked={lfType === 'job'}
                  onChange={() => setLfType('job')}
                />
                Job / Placement
              </label>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="intro-from" label="Available from">
                <Input id="intro-from" type="date" value={lfFrom} onChange={(e) => setLfFrom(e.target.value)} />
              </Field>
              <Field id="intro-to" label="Available until (optional)">
                <Input id="intro-to" type="date" value={lfTo} onChange={(e) => setLfTo(e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="intro-linkedin" label="LinkedIn URL">
              <Input
                id="intro-linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/…"
              />
            </Field>
            <Field id="intro-github" label="GitHub URL">
              <Input
                id="intro-github"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/…"
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
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
  );
};

export default EditIntroDialog;
