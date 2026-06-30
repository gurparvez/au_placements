import React, { useState, useEffect } from 'react';
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
import SkillPicker from '@/components/SkillPicker';
import skillsApi, { type Skill } from '@/api/skills';
import SectionCard from './SectionCard';

const SkillsSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.student);

  // State
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [resolvedSkills, setResolvedSkills] = useState<Skill[]>([]);
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- 1. Load & Resolve Skills (preserved exactly) ---
  useEffect(() => {
    const resolveProfileSkills = async () => {
      if (!profile?.skills) return;

      setResolving(true);
      setLoadError(false);
      try {
        // 1. Separate IDs from Objects
        const rawSkills = profile.skills;

        // Determine IDs for the Edit State
        const ids: string[] = rawSkills.map((s: any) =>
          typeof s === 'string' ? s : s._id
        );
        setSkillIds(ids);

        // 2. Resolve Full Objects for UI Display
        // If the API already populated them, use them. If they are strings, fetch them.
        const skillPromises = rawSkills.map(async (s: any) => {
          if (typeof s === 'object' && s.name) {
            return s as Skill;
          }
          // It's an ID, fetch it
          try {
            const res = await skillsApi.getSkillById(s);
            return res.skill;
          } catch (e) {
            return null;
          }
        });

        const results = await Promise.all(skillPromises);
        const validSkills = results.filter((s): s is Skill => s !== null);

        setResolvedSkills(validSkills);
        // Some skills failed to resolve and were silently dropped
        if (validSkills.length < results.length) {
          setLoadError(true);
        }
      } catch (error) {
        console.error('Error resolving skills:', error);
        setLoadError(true);
      } finally {
        setResolving(false);
      }
    };

    resolveProfileSkills();
  }, [profile]);

  // Hydrate the editable skill ids whenever the dialog opens (mirrors the old reset logic)
  useEffect(() => {
    if (open && profile) {
      const ids = profile.skills.map((s: any) => (typeof s === 'string' ? s : s._id));
      setSkillIds(ids);
    }
  }, [open, profile]);

  if (!profile) return null;

  // --- Handlers ---

  const save = async () => {
    setSaving(true);
    try {
      await dispatch(updateStudentProfile({ skills: skillIds })).unwrap();
      toast.success('Skills updated');
      setOpen(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard title="Skills" onEdit={() => setOpen(true)} isEmpty={resolvedSkills.length === 0}>
        {/* --- READ-ONLY VIEW --- */}
        <div className="flex flex-wrap gap-2">
          {resolving && resolvedSkills.length === 0 && (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Loading skills...
            </p>
          )}

          {!resolving && loadError && (
            <p className="text-danger text-sm">Couldn't load some skills. Please refresh.</p>
          )}

          {!resolving && !loadError && resolvedSkills.length === 0 && (
            <p className="text-muted-foreground text-sm">No skills added yet.</p>
          )}

          {resolvedSkills.map((s) => (
            <div
              key={s._id}
              className="bg-surface-2 text-muted-foreground inline-flex items-center rounded-[7px] border border-border px-2.5 py-1 text-xs font-medium"
            >
              {s.displayName || s.name}
            </div>
          ))}
        </div>
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit skills</DialogTitle>
            <DialogDescription>
              Search and add the skills you want recruiters to see.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <SkillPicker
              selected={skillIds}
              setSelected={setSkillIds}
              // Pass resolved skills so chips show names immediately
              initialData={resolvedSkills}
              label="Search & add skills"
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

export default SkillsSection;
