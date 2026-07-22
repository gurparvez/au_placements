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
import { SelectField, DateField } from '@/components/ui/select-field';
import CoursePicker from '@/components/CoursePicker';
import { coursesApi, type Course } from '@/api/courses';
import SectionCard from './SectionCard';

// Local UI state for an education row.
interface EducationUI {
  _id?: string;
  level: 'university' | 'school';
  institute: string;
  from_date: string;
  to_date: string;
  course: string; // ID (sent to API) — university only
  course_name?: string; // Display name (for picker UI & view mode)
  specialization?: string; // university only
  board?: string; // school only
  grade?: string; // school only
  passing_year?: string; // school only
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
              level: edu.level === 'school' ? 'school' : 'university',
              institute: edu.institute || '',
              from_date: toInputDate(edu.from_date),
              to_date: toInputDate(edu.to_date),
              course: courseId,
              course_name: courseName,
              specialization: edu.specialization || '',
              board: edu.board || '',
              grade: edu.grade || '',
              passing_year: edu.passing_year ? String(edu.passing_year) : '',
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
      { level: 'university', institute: '', course: '', course_name: '', from_date: '', to_date: '', specialization: '', board: '', grade: '', passing_year: '' },
    ]);

  const removeRow = (i: number) => setList((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      // Keep only rows with the required fields; map course -> id for the API.
      const payload: EducationPayload[] = list
        .filter((e) =>
          e.level === 'university'
            ? e.institute.trim() && e.course && e.from_date && e.to_date
            : e.institute.trim() && e.grade && e.passing_year
        )
        .map((e) =>
          e.level === 'university'
            ? {
                level: 'university' as const,
                institute: e.institute,
                course: e.course, // Send ID
                from_date: e.from_date,
                to_date: e.to_date,
                specialization: e.specialization || undefined,
              }
            : {
                level: 'school' as const,
                institute: e.institute,
                grade: e.grade,
                board: e.board || undefined,
                passing_year: e.passing_year ? Number(e.passing_year) : undefined,
              }
        );

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
            Add your degrees and institutions.
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {items.map((edu: any, index: number) => {
              const fromYear = edu.from_date ? new Date(edu.from_date).getFullYear() : null;
              const toYear = edu.to_date ? new Date(edu.to_date).getFullYear() : null;
              const isSchool = edu.level === 'school';
              const courseName =
                edu.course && typeof edu.course === 'object' ? edu.course.name : undefined;
              const subLine = isSchool
                ? [edu.grade && `Class ${edu.grade}`, edu.board].filter(Boolean).join(' · ')
                : courseName;
              const yearLabel = isSchool
                ? edu.passing_year
                  ? String(edu.passing_year)
                  : ''
                : fromYear || toYear
                  ? rangeYears(edu.from_date, edu.to_date)
                  : '';
              return (
                <li key={edu._id ?? index} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="bg-surface-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <GraduationCap className="text-muted-foreground h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-foreground font-medium">{edu.institute}</h3>
                        {subLine && (
                          <p className="text-muted-foreground text-sm">{subLine}</p>
                        )}
                      </div>
                      {yearLabel && (
                        <p className="data text-text-subtle shrink-0 text-xs whitespace-nowrap">
                          {yearLabel}
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
            <DialogTitle className="font-display">Edit education</DialogTitle>
            <DialogDescription>Add degrees and institutions.</DialogDescription>
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

                  <div className="mb-4 inline-flex rounded-[9px] border border-border bg-card p-1">
                    {(['university', 'school'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => change(i, 'level', lvl)}
                        className={
                          'rounded-[7px] px-3 py-1.5 text-[13px] font-medium transition-colors ' +
                          (edu.level === lvl
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:text-foreground')
                        }
                      >
                        {lvl === 'university' ? 'University' : 'School (10th / 12th)'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {edu.level === 'university' ? (
                      <>
                        <div className="sm:col-span-2">
                          <label htmlFor={`edu-institute-${i}`} className="mb-1.5 block text-sm font-medium">
                            Institute
                          </label>
                          <SelectField
                            id={`edu-institute-${i}`}
                            aria-label="Institute"
                            placeholder="Select an institute"
                            value={edu.institute}
                            onChange={(v) => change(i, 'institute', v)}
                            options={[
                              { value: '', label: 'Select an institute' },
                              ...INSTITUTE_OPTIONS.map((opt) => ({ value: opt, label: opt })),
                            ]}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor={`edu-course-${i}`} className="mb-1.5 block text-sm font-medium">
                            Course
                          </label>
                          <CoursePicker value={edu.course_name} onSelect={(course) => selectCourse(i, course)} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="sm:col-span-2">
                          <label htmlFor={`edu-school-${i}`} className="mb-1.5 block text-sm font-medium">
                            School name
                          </label>
                          <Input
                            id={`edu-school-${i}`}
                            value={edu.institute}
                            onChange={(e) => change(i, 'institute', e.target.value)}
                            placeholder="e.g. Delhi Public School"
                          />
                        </div>
                        <div>
                          <label htmlFor={`edu-grade-${i}`} className="mb-1.5 block text-sm font-medium">
                            Class
                          </label>
                          <SelectField
                            id={`edu-grade-${i}`}
                            aria-label="Class"
                            placeholder="Select"
                            value={edu.grade ?? ''}
                            onChange={(v) => change(i, 'grade', v)}
                            options={[
                              { value: '', label: 'Select' },
                              { value: '10th', label: '10th' },
                              { value: '12th', label: '12th' },
                            ]}
                          />
                        </div>
                        <div>
                          <label htmlFor={`edu-board-${i}`} className="mb-1.5 block text-sm font-medium">
                            Board <span className="text-muted-foreground">(optional)</span>
                          </label>
                          <Input
                            id={`edu-board-${i}`}
                            value={edu.board}
                            onChange={(e) => change(i, 'board', e.target.value)}
                            placeholder="e.g. CBSE, ICSE, PSEB"
                          />
                        </div>
                        <div>
                          <label htmlFor={`edu-passing-${i}`} className="mb-1.5 block text-sm font-medium">
                            Passing year
                          </label>
                          <Input
                            id={`edu-passing-${i}`}
                            type="number"
                            inputMode="numeric"
                            min={1950}
                            max={2100}
                            value={edu.passing_year}
                            onChange={(e) => change(i, 'passing_year', e.target.value)}
                            placeholder="e.g. 2020"
                          />
                        </div>
                      </>
                    )}

                    {edu.level === 'university' && (
                      <>
                        <div>
                          <label htmlFor={`edu-from-${i}`} className="mb-1.5 block text-sm font-medium">
                            From date
                          </label>
                          <DateField
                            value={edu.from_date}
                            onChange={(v) => change(i, 'from_date', v)}
                            aria-label="From date"
                          />
                        </div>
                        <div>
                          <label htmlFor={`edu-to-${i}`} className="mb-1.5 block text-sm font-medium">
                            To date
                          </label>
                          <DateField
                            value={edu.to_date}
                            onChange={(v) => change(i, 'to_date', v)}
                            aria-label="To date"
                          />
                        </div>
                      </>
                    )}

                    {edu.level === 'university' && (
                      <div className="sm:col-span-2">
                        <label htmlFor={`edu-specialization-${i}`} className="mb-1.5 block text-sm font-medium">
                          Specialization <span className="text-muted-foreground">(optional)</span>
                        </label>
                        <Input
                          id={`edu-specialization-${i}`}
                          value={edu.specialization}
                          onChange={(e) => change(i, 'specialization', e.target.value)}
                          placeholder="e.g. Artificial Intelligence"
                        />
                      </div>
                    )}
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
