import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import StudentCard from '@/components/StudentCard';

import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchAllStudents } from '@/context/student/studentSlice';
import { skillsApi } from '@/api/skills';
import { Search } from 'lucide-react'; // Optional: specific icon if you have lucide-react, otherwise standard input is fine

const StudentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { allStudents, loading, error } = useAppSelector((s) => s.student);

  // All skills (from /api/skills)
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  // UI filter state
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [openToFilter, setOpenToFilter] = useState<'internship' | 'job' | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);

  // New state for Skill Search inside Sidebar
  const [skillSearchQuery, setSkillSearchQuery] = useState(''); 

  const [experienceRange, setExperienceRange] = useState<string | null>(null);
  const [preferredField, setPreferredField] = useState<string | null>(null);

  /* ---------------------- FETCH DATA ---------------------- */
  useEffect(() => {
    dispatch(fetchAllStudents());

    (async () => {
      try {
        setSkillsLoading(true);
        const res = await skillsApi.getAllSkills();
        const names = (res.skills ?? []).map((s) => s.displayName || s.name).filter(Boolean);
        setSkillsList(Array.from(new Set(names)));
      } catch (e) {
        console.error('Failed to load skills:', e);
      } finally {
        setSkillsLoading(false);
      }
    })();
  }, [dispatch]);

  /* ---------------------- FILTER STUDENTS ---------------------- */
  const filteredStudents = useMemo(() => {
    if (!allStudents) return [];

    const q = query.trim().toLowerCase();

    return allStudents.filter((student) => {
      const fullName = `${student.user?.firstName ?? ''} ${student.user?.lastName ?? ''}`.trim();

      const studentSkills: string[] = Array.isArray(student.skills)
        ? student.skills
            .map((s: any) => s?.displayName || s?.name || '')
            .filter((x: string) => x.length > 0)
        : [];

      const openTo: string[] = Array.isArray(student.looking_for) ? student.looking_for : [];
      const field: string = student.preferred_field ?? '';

      if (q) {
        const matchesQuery =
          fullName.toLowerCase().includes(q) ||
          (student.headline ?? '').toLowerCase().includes(q) ||
          studentSkills.join(' ').toLowerCase().includes(q) ||
          field.toLowerCase().includes(q);

        if (!matchesQuery) return false;
      }

      if (selectedSkills.length > 0) {
        const hasAll = selectedSkills.every((sk) => studentSkills.includes(sk));
        if (!hasAll) return false;
      }

      if (openToFilter && !openTo.includes(openToFilter)) {
        return false;
      }

      if (fieldFilter && field !== fieldFilter) {
        return false;
      }

      if (experienceRange) {
        const exp = student.total_experience ?? 0;
        if (experienceRange === '0-6' && !(exp >= 0 && exp <= 6)) return false;
        if (experienceRange === '6-12' && !(exp >= 6 && exp <= 12)) return false;
        if (experienceRange === '12-24' && !(exp >= 12 && exp <= 24)) return false;
        if (experienceRange === '24+' && exp < 24) return false;
      }

      if (preferredField && student.preferred_field !== preferredField) {
        return false;
      }

      return true;
    });
  }, [
    allStudents,
    query,
    selectedSkills,
    openToFilter,
    fieldFilter,
    experienceRange,
    preferredField,
  ]);

  /* ---------------------- UI HELPERS ---------------------- */
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const clearAllFilters = () => {
    setQuery('');
    setSelectedSkills([]);
    setOpenToFilter(null);
    setFieldFilter(null);
    setSkillSearchQuery(''); // Also clear local skill search
  };

  const uniquePreferredFields = useMemo(() => {
    if (!allStudents) return [];
    const fields = allStudents.map((s: any) => s.preferred_field).filter(Boolean);
    return Array.from(new Set(fields));
  }, [allStudents]);

  const filtersActive =
    query.trim() !== '' ||
    selectedSkills.length > 0 ||
    openToFilter !== null ||
    fieldFilter !== null;

  /* ---------------------- RENDER ---------------------- */
  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 pt-28 pb-10">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
            <p className="text-muted-foreground text-sm">
              Browse students by skills, field preferences, and interests.
            </p>
          </div>

          <div className="text-muted-foreground text-right text-xs">
            <div>{filteredStudents.length} students shown</div>

            {filtersActive && (
              <button
                onClick={clearAllFilters}
                className="text-primary mt-1 text-xs font-medium hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT: Skills filter */}
          <aside className="col-span-12 md:col-span-3">
            <div className="sticky top-24">
              <div className="bg-card rounded-md border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium">Skills</h3>
                  {selectedSkills.length > 0 && (
                    <button
                      className="text-muted-foreground text-[11px] hover:underline"
                      onClick={() => setSelectedSkills([])}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* --- NEW: Skill Search Bar --- */}
                <div className="mb-3">
                  <Input 
                    placeholder="Find a skill..." 
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    className="h-8 text-xs" 
                  />
                </div>

                <div className="flex max-h-[60vh] flex-col gap-2 overflow-auto pr-1">
                  {skillsLoading && (
                    <div className="text-muted-foreground text-xs">Loading skills…</div>
                  )}

                  {!skillsLoading &&
                    skillsList
                      // Filter skills based on sidebar search
                      .filter(skill => 
                        skill.toLowerCase().includes(skillSearchQuery.trim().toLowerCase())
                      )
                      .map((skill) => (
                        <Button
                          key={skill}
                          variant={selectedSkills.includes(skill) ? 'default' : 'ghost'}
                          onClick={() => toggleSkill(skill)}
                          className="w-full justify-start rounded-full px-3 py-1 text-sm"
                        >
                          {skill}
                        </Button>
                      ))}

                  {!skillsLoading && skillsList.length === 0 && (
                    <div className="text-muted-foreground text-xs">No skills available.</div>
                  )}
                  
                  {/* Empty state for when search returns no results */}
                  {!skillsLoading && skillsList.length > 0 && 
                    skillsList.filter(s => s.toLowerCase().includes(skillSearchQuery.toLowerCase())).length === 0 && (
                     <div className="text-muted-foreground mt-2 text-xs">No matching skills found.</div>
                  )}
                </div>

                {selectedSkills.length > 0 && (
                  <div className="text-muted-foreground mt-3 text-[11px]">
                    Selected: <span className="font-medium">{selectedSkills.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* RIGHT: search, filters, list */}
          <main className="col-span-12 md:col-span-9">
            {/* Search */}
            <div className="mb-4 flex justify-center">
              <div className="w-full md:w-3/4">
                <Input
                  placeholder="Search students by name, skill, or field..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              {/* All Button */}
              <Button
                size="sm"
                variant={
                  !openToFilter && !experienceRange && !preferredField ? 'secondary' : 'ghost'
                }
                onClick={() => {
                  setOpenToFilter(null);
                  setExperienceRange(null);
                  setPreferredField(null);
                }}
              >
                All
              </Button>

              {/* Internship */}
              <Button
                size="sm"
                variant={openToFilter === 'internship' ? 'secondary' : 'ghost'}
                onClick={() => setOpenToFilter((v) => (v === 'internship' ? null : 'internship'))}
              >
                Internship
              </Button>

              {/* Placement */}
              <Button
                size="sm"
                variant={openToFilter === 'job' ? 'secondary' : 'ghost'}
                onClick={() => setOpenToFilter((v) => (v === 'job' ? null : 'job'))}
              >
                Placement
              </Button>

              {/* Experience Range Dropdown */}
              <select
                value={experienceRange ?? ''}
                onChange={(e) => setExperienceRange(e.target.value || null)}
                className="bg-card rounded-md border px-3 py-1 text-sm"
              >
                <option value="">Experience (any)</option>
                <option value="0-6">0-6 months</option>
                <option value="6-12">6-12 months</option>
                <option value="12-24">1-2 years</option>
                <option value="24+">2+ years</option>
              </select>

              {/* Preferred Field Dropdown */}
              <select
                value={preferredField ?? ''}
                onChange={(e) => setPreferredField(e.target.value || null)}
                className="bg-card rounded-md border px-3 py-1 text-sm"
              >
                <option value="">Preferred Field (any)</option>

                {uniquePreferredFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            <Separator className="mb-6" />

            {/* Students list */}
            <div className="max-h-[60vh] space-y-6 overflow-auto pr-2">
              {loading && <div className="text-muted-foreground text-center text-sm">Loading…</div>}

              {!loading && error && (
                <div className="text-center text-sm text-red-500">
                  Failed to load students: {error}
                </div>
              )}

              {!loading &&
                !error &&
                filteredStudents.map((st: any) => {
                  const name = `${st.user?.firstName ?? ''} ${st.user?.lastName ?? ''}`.trim();

                  const courseName = st.education?.[0]?.course?.name ?? '—';

                  const skillsNames: string[] = Array.isArray(st.skills)
                    ? st.skills
                        .map((s: any) => s?.displayName || s?.name || '')
                        .filter((x: string) => x.length > 0)
                    : [];

                  const openToLabel =
                    Array.isArray(st.looking_for) && st.looking_for.length > 0
                      ? st.looking_for.join(', ')
                      : '—';

                  const experienceLabel = `${
                    typeof st.total_experience === 'number' ? st.total_experience : 0
                  } months`;

                  return (
                    <StudentCard
                      key={st._id}
                      userId={st.user._id}
                      image_url={st.profile_image || '/avatar-placeholder.png'}
                      name={name}
                      class={courseName}
                      location={st.location}
                      headline={st.headline}
                      feild_preference={st.preferred_field}
                      open_to={openToLabel}
                      exprience={experienceLabel}
                      skills={skillsNames}
                    />
                  );
                })}

              {!loading && !error && filteredStudents.length === 0 && (
                <div className="text-muted-foreground text-center text-sm">
                  No students found. Try changing filters or search text.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </main>
  );
};

export default StudentsPage;
