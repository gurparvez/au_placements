import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import SectionCard from './SectionCard';

const AboutSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.student);

  const [open, setOpen] = useState(false);
  const [about, setAbout] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setAbout(profile?.about ?? '');
  }, [open, profile]);

  if (!profile) return null;

  const save = async () => {
    setSaving(true);
    try {
      await dispatch(updateStudentProfile({ about })).unwrap();
      toast.success('About updated');
      setOpen(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard title="About" onEdit={() => setOpen(true)} isEmpty={!profile.about?.trim()}>
        {profile.about?.trim() ? (
          <p className="text-foreground/90 max-w-[65ch] text-sm leading-relaxed whitespace-pre-wrap">
            {profile.about}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Add a short summary of who you are, your strengths, and what you're looking for.
          </p>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit About</DialogTitle>
            <DialogDescription>
              A short, first-person summary works best — strengths, focus, and goals.
            </DialogDescription>
          </DialogHeader>

          <div>
            <label htmlFor="about-text" className="sr-only">
              About
            </label>
            <Textarea
              id="about-text"
              rows={7}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="e.g. Final-year CSE student at Akal University focused on full-stack development…"
            />
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

export default AboutSection;
