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
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import CoursePicker from '@/components/CoursePicker';
import { type Course } from '@/api/courses';
import departmentsApi, { type Department } from '@/api/departments';
import SectionCard from './SectionCard';

/**
 * The student's current academic record. Kept separate from the education
 * history because the placement cell reports on exactly these fields —
 * department, programme, and graduating batch.
 */

/** Mirrors PLACEMENT_INTENTS on the server. */
const INTENTS = [
  ['placement', 'Seeking placement'],
  ['higher_studies', 'Higher studies'],
  ['competitive_exam', 'Competitive exams'],
  ['entrepreneurship', 'Entrepreneurship'],
  ['family_business', 'Family business'],
  ['not_interested', 'Not interested'],
  ['deferred', 'Deferred'],
] as const;

type Intent = (typeof INTENTS)[number][0];

const intentLabel = (v?: string) => INTENTS.find(([k]) => k === v)?.[1] ?? 'Seeking placement';

interface FormState {
  department: string;
  course: string; // course id
  course_name: string;
  batch_year: string;
  placement_intent: Intent;
  opted_out_reason: string;
}

const emptyForm: FormState = {
  department: '', course: '', course_name: '', batch_year: '',
  placement_intent: 'placement', opted_out_reason: '',
};

/** Graduation years worth offering: last two batches through five years out. */
function batchYearOptions(): number[] {
  const now = new Date();
  const base = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
  return Array.from({ length: 8 }, (_, i) => base - 2 + i);
}

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <dt className="text-muted-foreground text-xs font-medium">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium">{value ?? <span className="text-muted-foreground">—</span>}</dd>
  </div>
);

const AcademicSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.student);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Load the official department list once the editor opens.
  useEffect(() => {
    if (open && departments.length === 0) {
      departmentsApi.list().then(setDepartments).catch(() => { /* dropdown just stays empty */ });
    }
  }, [open, departments.length]);

  const p: any = profile;
  const courseName = p?.course && typeof p.course === 'object' ? p.course.name : undefined;

  const isEmpty = !p?.department && !p?.batch_year && !courseName;

  // Re-hydrate from the profile every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setForm({
      department: p?.department ?? '',
      course: p?.course && typeof p.course === 'object' ? p.course._id : (p?.course ?? ''),
      course_name: courseName ?? '',
      batch_year: p?.batch_year ? String(p.batch_year) : '',
      placement_intent: (p?.placement_intent ?? 'placement') as Intent,
      opted_out_reason: p?.opted_out_reason ?? '',
    });
  }, [open, p, courseName]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(
        updateStudentProfile({
          department: form.department.trim() || undefined,
          course: form.course || undefined,
          batch_year: form.batch_year ? Number(form.batch_year) : undefined,
          placement_intent: form.placement_intent,
          opted_out_reason: form.placement_intent === 'placement' ? '' : form.opted_out_reason.trim(),
        } as any)
      ).unwrap();
      toast.success('Academic details updated');
      setOpen(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Could not save academic details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard title="Academic record" onEdit={() => setOpen(true)} isEmpty={isEmpty}>
        {isEmpty ? (
          <p className="text-muted-foreground text-sm">
            Add department, programme, and graduating batch.
          </p>
        ) : (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Row label="Department" value={p?.department} />
            <Row label="Course" value={courseName} />
            <Row label="Batch" value={p?.batch_year != null ? <span className="data">{p.batch_year}</span> : undefined} />
            <Row
              label="CGPA"
              value={
                p?.cgpa != null ? (
                  <>
                    <span className="data">{p.cgpa}</span>{' '}
                    <span className="text-brass">(verified)</span>
                  </>
                ) : undefined
              }
            />
            <Row
              label="Active backlogs"
              value={
                p?.backlogs != null ? (
                  <span className={p.backlogs > 0 ? 'text-destructive' : undefined}>{p.backlogs}</span>
                ) : undefined
              }
            />
            <Row
              label="Placement status"
              value={
                <span className={(p?.placement_intent ?? 'placement') === 'placement' ? 'text-primary' : 'text-muted-foreground'}>
                  {intentLabel(p?.placement_intent)}
                </span>
              }
            />
          </dl>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Academic record</DialogTitle>
            <DialogDescription>
              Used for eligibility and reporting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label htmlFor="ac-dept" className="mb-1.5 block text-sm font-medium">
                Department
              </label>
              <SelectField
                id="ac-dept"
                aria-label="Department"
                placeholder="Select your department…"
                value={form.department}
                onChange={(v) => set('department', v)}
                options={[
                  { value: '', label: 'Select your department…' },
                  // Keep the stored value selectable even if it was later deactivated.
                  ...(form.department && !departments.some((d) => d.name === form.department)
                    ? [{ value: form.department, label: form.department }]
                    : []),
                  ...departments.map((d) => ({ value: d.name, label: d.name })),
                ]}
              />
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium">Course / programme</span>
              {/* allowCreate is off — students choose from the official catalogue only. */}
              <CoursePicker
                value={form.course_name}
                allowCreate={false}
                onSelect={(c: Course) => setForm((f) => ({ ...f, course: c._id, course_name: c.name }))}
              />
            </div>

            <div>
              <label htmlFor="ac-batch" className="mb-1.5 block text-sm font-medium">
                Batch
              </label>
              <SelectField
                id="ac-batch"
                aria-label="Batch"
                placeholder="—"
                value={form.batch_year}
                onChange={(v) => set('batch_year', v)}
                options={[
                  { value: '', label: '—' },
                  ...batchYearOptions().map((y) => ({ value: String(y), label: String(y) })),
                ]}
              />
            </div>

            <div className="border-t pt-4">
              <label htmlFor="ac-intent" className="mb-1.5 block text-sm font-medium">
                Placement status
              </label>
              <SelectField
                id="ac-intent"
                aria-label="Placement status"
                value={form.placement_intent}
                onChange={(v) => set('placement_intent', v as Intent)}
                options={INTENTS.map(([k, v]) => ({ value: k, label: v }))}
              />
              <p className="text-muted-foreground mt-1.5 text-xs">
                Opting out removes you from placement drives.
              </p>
            </div>

            {form.placement_intent !== 'placement' && (
              <div>
                <label htmlFor="ac-reason" className="mb-1.5 block text-sm font-medium">
                  Reason <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  id="ac-reason"
                  value={form.opted_out_reason}
                  onChange={(e) => set('opted_out_reason', e.target.value)}
                  placeholder="e.g. Preparing for GATE"
                />
              </div>
            )}

            <p className="text-muted-foreground border-t pt-4 text-xs">
              CGPA and backlogs are not editable here.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
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
    </>
  );
};

export default AcademicSection;
