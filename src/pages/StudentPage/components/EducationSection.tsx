import React, { useEffect, useState } from 'react';
import { GraduationCap, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import { type EducationPayload } from '@/api/students.types';
import { rangeYears } from '@/utils/dates';
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
import CoursePicker from '@/components/CoursePicker';
import { coursesApi, type Course } from '@/api/courses';
import SectionCard from './SectionCard';

// Local UI state for an education row.
interface EducationUI {
  _id?: string;
  institute: string;
  from_date: string;
  to_date: string;
  course: string; // ID (sent to API)
  course_name?: string; // Display name (for picker UI & view mode)
  specialization?: string;
}

const INSTITUTE_OPTIONS = ['Akal University', 'Eternal University'];

const toInputDate = (d?: string) => (d ? new Date(d).toISOString().split('T')[0] : '');

const EducationSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.student);

  const [open, setOpen] = useState(false);
  const [list, setList] = useState<EducationUI[]>([]);
  const [hydrating, setHydrating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hydrate the editable list whenever the dialog opens, resolving any
  // course names we don't already have from a populated object.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const hydrate = async () => {
      setHydrating(true);
      try {
        const resolved = await Promise.all(
          (profile?.education ?? []).map(async (edu: any) => {
            let courseId = '';
            let courseName = '';

            // course may be a populated object or a bare string ID.
            if (edu.course && typeof edu.course === 'object') {
              courseId = edu.course._id;
              courseName = edu.course.name;
            } else if (typeof edu.course === 'string') {
              courseId = edu.course;
              try {
                const res = await coursesApi.getCourseById(courseId);
                courseName = res.course.name;
              } catch (e) {
                console.error('Failed to fetch course name', e);
                courseName = 'Unknown Course';
              }
            }

            return {
              _id: edu._id,
              institute: edu.institute || '',
              from_date: toInputDate(edu.from_date),
              to_date: toInputDate(edu.to_date),
              course: courseId,
              course_name: courseName,
              specialization: edu.specialization || '',
            } as EducationUI;
          })
        );

        if (!cancelled) setList(resolved);
      } finally {
        if (!cancelled) setHydrating(false);
      }
    };

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [open, profile]);

  if (!profile) return null;

  const change = (i: number, field: keyof EducationUI, value: string) =>
    setList((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const selectCourse = (i: number, course: Course) =>
    setList((prev) =>
      prev.map((row, idx) =>
        idx === i ? { ...row, course: course._id, course_name: course.name } : row
      )
    );

  const addRow = () =>
    setList((prev) => [
      ...prev,
      { institute: '', course: '', course_name: '', from_date: '', to_date: '', specialization: '' },
    ]);

  const removeRow = (i: number) => setList((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      // Keep only rows with the required fields; map course -> id for the API.
      const payload: EducationPayload[] = list
        .filter((e) => e.institute.trim() && e.course && e.from_date && e.to_date)
        .map((e) => ({
          institute: e.institute,
          course: e.course, // Send ID
          from_date: e.from_date,
          to_date: e.to_date,
          specialization: e.specialization || undefined,
        }));

      await dispatch(updateStudentProfile({ education: payload })).unwrap();
      toast.success('Education updated');
      setOpen(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const items = profile.education ?? [];

  return (
    <>
      <SectionCard title="Education" onEdit={() => setOpen(true)} isEmpty={items.length === 0}>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add your degrees and institutions to complete your academic profile.
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {items.map((edu: any, index: number) => {
              const fromYear = edu.from_date ? new Date(edu.from_date).getFullYear() : null;
              const toYear = edu.to_date ? new Date(edu.to_date).getFullYear() : null;
              const courseName =
                edu.course && typeof edu.course === 'object' ? edu.course.name : undefined;
              return (
                <li key={edu._id ?? index} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="bg-surface-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <GraduationCap className="text-muted-foreground h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-foreground font-medium">{edu.institute}</h3>
                        {courseName && (
                          <p className="text-muted-foreground text-sm">{courseName}</p>
                        )}
                      </div>
                      {fromYear && toYear && (
                        <p className="data text-text-subtle shrink-0 text-xs whitespace-nowrap">
                          {rangeYears(edu.from_date, edu.to_date)}
                        </p>
                      )}
                    </div>
                    {edu.specialization && (
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {edu.specialization}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit education</DialogTitle>
            <DialogDescription>Add the degrees and institutions you've studied at.</DialogDescription>
          </DialogHeader>

          {hydrating ? (
            <div className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading education details…
            </div>
          ) : (
            <div className="space-y-5">
              {list.map((edu, i) => (
                <div key={i} className="bg-bg-2 relative rounded-lg border border-border p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-danger absolute top-2 right-2 h-8 w-8"
                    onClick={() => removeRow(i)}
                    aria-label={`Delete education ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`edu-institute-${i}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Institute
                      </label>
                      <select
                        id={`edu-institute-${i}`}
                        value={edu.institute}
                        onChange={(e) => change(i, 'institute', e.target.value)}
                        className="border-border-strong bg-card text-foreground ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-[9px] border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <option value="">Select an institute</option>
                        {INSTITUTE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`edu-course-${i}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Course
                      </label>
                      <CoursePicker
                        value={edu.course_name}
                        onSelect={(course) => selectCourse(i, course)}
                      />
                    </div>

                    <div>
                      <label htmlFor={`edu-from-${i}`} className="mb-1.5 block text-sm font-medium">
                        From date
                      </label>
                      <Input
                        id={`edu-from-${i}`}
                        type="date"
                        value={edu.from_date}
                        onChange={(e) => change(i, 'from_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor={`edu-to-${i}`} className="mb-1.5 block text-sm font-medium">
                        To date
                      </label>
                      <Input
                        id={`edu-to-${i}`}
                        type="date"
                        value={edu.to_date}
                        onChange={(e) => change(i, 'to_date', e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`edu-specialization-${i}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Specialization <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <Input
                        id={`edu-specialization-${i}`}
                        value={edu.specialization}
                        onChange={(e) => change(i, 'specialization', e.target.value)}
                        placeholder="e.g. Artificial Intelligence"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full border-dashed" onClick={addRow}>
                <Plus className="mr-1 h-4 w-4" aria-hidden /> Add education
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving || hydrating}>
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

export default EducationSection;
