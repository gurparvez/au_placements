import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { rangeYears } from '@/utils/dates';

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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SectionCard from './SectionCard';

interface ExperienceItem {
  _id?: string;
  role: string;
  company: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

const toInputDate = (d?: string) => (d ? new Date(d).toISOString().split('T')[0] : '');

const ExperienceSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.student);

  const [open, setOpen] = useState(false);
  const [list, setList] = useState<ExperienceItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Hydrate the editable list whenever the dialog opens
  useEffect(() => {
    if (open) setList(profile?.experience ?? []);
  }, [open, profile]);

  if (!profile) return null;

  const change = (i: number, field: keyof ExperienceItem, value: string) =>
    setList((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const addRow = () =>
    setList((prev) => [...prev, { role: '', company: '', start_date: '', description: '' }]);

  const removeRow = (i: number) => setList((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const cleaned = list.filter((e) => e.role.trim() && e.company.trim() && e.start_date);
      await dispatch(updateStudentProfile({ experience: cleaned })).unwrap();
      toast.success('Experience updated');
      setOpen(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const items = profile.experience ?? [];

  return (
    <>
      <SectionCard title="Experience" onEdit={() => setOpen(true)} isEmpty={items.length === 0}>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add internships and jobs to show recruiters what you've done.
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {items.map((exp) => (
              <li key={exp._id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="bg-surface-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Briefcase className="text-muted-foreground h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-foreground font-medium">{exp.role}</h3>
                      <p className="text-muted-foreground text-sm">{exp.company}</p>
                    </div>
                    <p className="data text-text-subtle shrink-0 text-xs whitespace-nowrap">
                      {rangeYears(exp.start_date, exp.end_date)}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit experience</DialogTitle>
            <DialogDescription>Add the internships and roles you've held.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {list.map((exp, i) => (
              <div key={i} className="bg-bg-2 relative rounded-lg border border-border p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-danger absolute top-2 right-2 h-8 w-8"
                  onClick={() => removeRow(i)}
                  aria-label={`Delete experience ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`exp-role-${i}`} className="mb-1.5 block text-sm font-medium">
                      Role
                    </label>
                    <Input
                      id={`exp-role-${i}`}
                      value={exp.role}
                      onChange={(e) => change(i, 'role', e.target.value)}
                      placeholder="Software Engineering Intern"
                    />
                  </div>
                  <div>
                    <label htmlFor={`exp-company-${i}`} className="mb-1.5 block text-sm font-medium">
                      Company
                    </label>
                    <Input
                      id={`exp-company-${i}`}
                      value={exp.company}
                      onChange={(e) => change(i, 'company', e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label htmlFor={`exp-start-${i}`} className="mb-1.5 block text-sm font-medium">
                      Start date
                    </label>
                    <Input
                      id={`exp-start-${i}`}
                      type="date"
                      value={toInputDate(exp.start_date)}
                      onChange={(e) => change(i, 'start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`exp-end-${i}`} className="mb-1.5 block text-sm font-medium">
                      End date <span className="text-muted-foreground">(blank = present)</span>
                    </label>
                    <Input
                      id={`exp-end-${i}`}
                      type="date"
                      value={toInputDate(exp.end_date)}
                      onChange={(e) => change(i, 'end_date', e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`exp-desc-${i}`} className="mb-1.5 block text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id={`exp-desc-${i}`}
                      rows={3}
                      value={exp.description}
                      onChange={(e) => change(i, 'description', e.target.value)}
                      placeholder="What did you work on?"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full border-dashed" onClick={addRow}>
              <Plus className="mr-1 h-4 w-4" aria-hidden /> Add experience
            </Button>
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

export default ExperienceSection;
