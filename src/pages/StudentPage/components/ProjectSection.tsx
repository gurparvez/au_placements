import React, { useEffect, useState } from 'react';
import { FolderGit2, Plus, Trash2, Github, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import { type ProjectPayload } from '@/api/students.types';
import skillsApi, { type Skill } from '@/api/skills';
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
import { DateField } from '@/components/ui/select-field';
import SkillPicker from '@/components/SkillPicker';
import SectionCard from './SectionCard';

// Local interface bridging the API response and form state.
interface ProjectUI {
  _id?: string;
  title: string;
  start_date: string;
  end_date?: string;
  on_going?: boolean;
  tech_used: string[]; // IDs for the API
  tech_used_resolved?: Skill[]; // Full objects for display
  code_url?: string;
  live_url?: string;
  description?: string;
}

const toInputDate = (d?: string) => (d ? new Date(d).toISOString().split('T')[0] : '');

const ProjectsSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.student);

  const [open, setOpen] = useState(false);
  const [list, setList] = useState<ProjectUI[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Resolve project tech_used skill IDs into full Skill objects for display.
  useEffect(() => {
    let cancelled = false;

    const fetchSkillsForProjects = async () => {
      if (!profile?.projects) {
        setList([]);
        return;
      }

      setLoadError(false);

      try {
        const resolvedProjectsPromises = profile.projects.map(async (p: any) => {
          // Normalise tech_used into an array of IDs.
          const skillIds: string[] = p.tech_used
            ? p.tech_used.map((t: any) => (typeof t === 'string' ? t : t._id))
            : [];

          // Fetch full skill details in parallel; null on failure (filtered out).
          const skillPromises = skillIds.map((id) =>
            skillsApi
              .getSkillById(id)
              .then((res) => res.skill)
              .catch(() => null),
          );

          const fetchedSkills = await Promise.all(skillPromises);
          const validSkills = fetchedSkills.filter((s): s is Skill => s !== null);

          return {
            _id: p._id,
            title: p.title || '',
            start_date: toInputDate(p.start_date),
            end_date: toInputDate(p.end_date),
            on_going: p.on_going || false,
            description: p.description || '',
            code_url: p.code_url || '',
            live_url: p.live_url || '',
            tech_used: skillIds,
            tech_used_resolved: validSkills,
          } as ProjectUI;
        });

        const resolvedList = await Promise.all(resolvedProjectsPromises);
        if (!cancelled) setList(resolvedList);
      } catch (error) {
        console.error('Error resolving project skills:', error);
        if (!cancelled) setLoadError(true);
      }
    };

    fetchSkillsForProjects();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (!profile) return null;

  const change = (i: number, field: keyof ProjectUI, value: any) =>
    setList((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const changeSkills = (i: number, newIds: string[]) =>
    setList((prev) => prev.map((row, idx) => (idx === i ? { ...row, tech_used: newIds } : row)));

  const addRow = () =>
    setList((prev) => [
      ...prev,
      { title: '', start_date: '', description: '', tech_used: [], tech_used_resolved: [] },
    ]);

  const removeRow = (i: number) => setList((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      // Keep only rows with the required fields filled in.
      const cleaned = list.filter((p) => p.title.trim() && p.start_date);

      const projects: ProjectPayload[] = cleaned.map((p) => ({
        title: p.title,
        start_date: p.start_date,
        end_date: p.on_going ? undefined : p.end_date || undefined,
        on_going: p.on_going,
        tech_used: p.tech_used, // send IDs
        code_url: p.code_url || undefined,
        live_url: p.live_url || undefined,
        description: p.description,
      }));

      await dispatch(updateStudentProfile({ projects })).unwrap();
      toast.success('Projects updated');
      setOpen(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const items = list;

  return (
    <>
      <SectionCard title="Projects" onEdit={() => setOpen(true)} isEmpty={items.length === 0}>
        {loadError && (
          <p className="text-danger mb-3 text-sm">
            Couldn't load project details. Please refresh.
          </p>
        )}

        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Showcase the projects you've built.
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {items.map((pr, i) => (
              <li key={pr._id ?? i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="bg-surface-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <FolderGit2 className="text-muted-foreground h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-foreground font-medium">{pr.title}</h3>
                      <p className="data text-text-subtle text-sm">
                        {pr.start_date ? new Date(pr.start_date).getFullYear() : ''}
                        {pr.on_going ? ' – Ongoing' : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-3">
                      {pr.code_url && (
                        <a
                          href={pr.code_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View source code"
                          className="text-muted-foreground hover:text-foreground rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          <Github className="h-4 w-4" aria-hidden />
                        </a>
                      )}
                      {pr.live_url && (
                        <a
                          href={pr.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View live project"
                          className="text-muted-foreground hover:text-foreground rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          <Globe className="h-4 w-4" aria-hidden />
                        </a>
                      )}
                    </div>
                  </div>

                  {pr.description && (
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                      {pr.description}
                    </p>
                  )}

                  {pr.tech_used_resolved && pr.tech_used_resolved.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pr.tech_used_resolved.map((skill) => (
                        <span
                          key={skill._id}
                          className="bg-surface-2 text-muted-foreground inline-flex items-center rounded-[7px] border border-border px-2.5 py-0.5 text-xs"
                        >
                          {skill.displayName || skill.name}
                        </span>
                      ))}
                    </div>
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
            <DialogTitle className="font-display">Edit projects</DialogTitle>
            <DialogDescription>Showcase the projects you've built.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {list.map((pr, i) => (
              <div key={i} className="bg-bg-2 relative rounded-lg border border-border p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-danger absolute top-2 right-2 h-8 w-8"
                  onClick={() => removeRow(i)}
                  aria-label={`Delete project ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor={`proj-title-${i}`} className="mb-1.5 block text-sm font-medium">
                      Title
                    </label>
                    <Input
                      id={`proj-title-${i}`}
                      value={pr.title}
                      onChange={(e) => change(i, 'title', e.target.value)}
                      placeholder="e.g. Portfolio Website"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`proj-start-${i}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Start date
                      </label>
                      <DateField
                        value={toInputDate(pr.start_date)}
                        onChange={(v) => change(i, 'start_date', v)}
                        aria-label="Start date"
                      />
                    </div>
                    <div>
                      <label htmlFor={`proj-end-${i}`} className="mb-1.5 block text-sm font-medium">
                        End date <span className="text-muted-foreground">(blank = present)</span>
                      </label>
                      <DateField
                        disabled={pr.on_going}
                        value={toInputDate(pr.end_date)}
                        onChange={(v) => change(i, 'end_date', v)}
                        aria-label="End date"
                      />
                      <label
                        htmlFor={`proj-ongoing-${i}`}
                        className="mt-2 flex items-center gap-2 text-sm font-medium"
                      >
                        <input
                          id={`proj-ongoing-${i}`}
                          type="checkbox"
                          className="accent-primary h-4 w-4"
                          checked={!!pr.on_going}
                          onChange={(e) => change(i, 'on_going', e.target.checked)}
                        />
                        Ongoing
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor={`proj-code-${i}`} className="mb-1.5 block text-sm font-medium">
                        Code URL
                      </label>
                      <Input
                        id={`proj-code-${i}`}
                        value={pr.code_url}
                        onChange={(e) => change(i, 'code_url', e.target.value)}
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div>
                      <label htmlFor={`proj-live-${i}`} className="mb-1.5 block text-sm font-medium">
                        Live URL
                      </label>
                      <Input
                        id={`proj-live-${i}`}
                        value={pr.live_url}
                        onChange={(e) => change(i, 'live_url', e.target.value)}
                        placeholder="https://my-app.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`proj-desc-${i}`} className="mb-1.5 block text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id={`proj-desc-${i}`}
                      rows={3}
                      value={pr.description}
                      onChange={(e) => change(i, 'description', e.target.value)}
                      placeholder="What did you build?"
                    />
                  </div>

                  <div>
                    <SkillPicker
                      label="Technologies used"
                      selected={pr.tech_used}
                      setSelected={(newIds) => changeSkills(i, newIds)}
                      initialData={pr.tech_used_resolved}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full border-dashed" onClick={addRow}>
              <Plus className="mr-1 h-4 w-4" aria-hidden /> Add project
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

export default ProjectsSection;
