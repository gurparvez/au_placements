import React, { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react'; // Import Icon

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'; // Import Sheet components
import StudentCard from '@/components/StudentCard';

// State/API
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchAllStudents } from '@/context/student/studentSlice';
import { skillsApi } from '@/api/skills';

// ----------------------------------------------------------------------
// 1. REUSABLE COMPONENT: Skills Filter List
//    We extract this so we can use it inside the Sidebar (Desktop)
//    AND inside the Sheet (Mobile).
// ----------------------------------------------------------------------
interface SkillsFilterContentProps {
  skillsList: string[];
  skillsLoading: boolean;
  selectedSkills: string[];
  toggleSkill: (skill: string) => void;
  skillSearchQuery: string;
  setSkillSearchQuery: (val: string) => void;
  clearSkills: () => void;
}

const SkillsFilterContent: React.FC<SkillsFilterContentProps> = ({
  skillsList,
  skillsLoading,
  selectedSkills,
  toggleSkill,
  skillSearchQuery,
  setSkillSearchQuery,
  clearSkills,
}) => {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Skills</h3>
        {selectedSkills.length > 0 && (
          <button
            className="text-muted-foreground text-[11px] hover:underline"
            onClick={clearSkills}
          >
            Clear
          </button>
        )}
      </div>

      <div className="mb-3">
        <Input
          placeholder="Find a skill..."
          value={skillSearchQuery}
          onChange={(e) => setSkillSearchQuery(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="flex max-h-[60vh] flex-1 flex-col gap-2 overflow-y-auto pr-1 md:max-h-[calc(100vh-300px)]">
        {skillsLoading && <div className="text-muted-foreground text-xs">Loading skills…</div>}

        {!skillsLoading &&
          skillsList
            .filter((skill) => skill.toLowerCase().includes(skillSearchQuery.trim().toLowerCase()))
            .map((skill) => (
              <Button
                key={skill}
                variant={selectedSkills.includes(skill) ? 'default' : 'ghost'}
                onClick={() => toggleSkill(skill)}
                className="h-auto min-h-[32px] w-full justify-start rounded-full px-3 py-1 text-sm"
              >
                {skill}
              </Button>
            ))}

        {!skillsLoading &&
          skillsList.length > 0 &&
          skillsList.filter((s) => s.toLowerCase().includes(skillSearchQuery.toLowerCase()))
            .length === 0 && (
            <div className="text-muted-foreground mt-2 text-xs">No matching skills found.</div>
          )}
      </div>

      {selectedSkills.length > 0 && (
        <div className="text-muted-foreground mt-3 text-[11px]">
          Selected: <span className="font-medium">{selectedSkills.join(', ')}</span>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. MAIN PAGE COMPONENT
// ----------------------------------------------------------------------

const StudentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { allStudents, loading, error } = useAppSelector((s) => s.student);

  // All skills
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  // UI filter state
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [openToFilter, setOpenToFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  });

  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
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
    const filterFromDate = dateFilter.from ? new Date(dateFilter.from) : null;
    const filterToDate = dateFilter.to ? new Date(dateFilter.to) : null;

    return allStudents.filter((student) => {
      const fullName = `${student.user?.firstName ?? ''} ${student.user?.lastName ?? ''}`.trim();

      const studentSkills: string[] = Array.isArray(student.skills)
        ? student.skills
            .map((s: any) => s?.displayName || s?.name || '')
            .filter((x: string) => x.length > 0)
        : [];

      const openToType = student.looking_for?.type || '';
      const studentFrom = student.looking_for?.from_date
        ? new Date(student.looking_for.from_date)
        : null;
      const studentTo = student.looking_for?.to_date ? new Date(student.looking_for.to_date) : null;

      const field: string = student.preferred_field ?? '';

      // 1. Search Query
      if (q) {
        const matchesQuery =
          fullName.toLowerCase().includes(q) ||
          (student.headline ?? '').toLowerCase().includes(q) ||
          studentSkills.join(' ').toLowerCase().includes(q) ||
          field.toLowerCase().includes(q);

        if (!matchesQuery) return false;
      }

      // 2. Skills
      if (selectedSkills.length > 0) {
        const hasAll = selectedSkills.every((sk) => studentSkills.includes(sk));
        if (!hasAll) return false;
      }

      // 3. Opportunity Type
      if (openToFilter && openToType !== openToFilter) {
        return false;
      }

      // 4. Date Range Logic
      if (filterFromDate || filterToDate) {
        if (!studentFrom) return false;
        if (filterFromDate && studentFrom > filterFromDate) return false;
        if (filterToDate && studentTo && studentTo < filterToDate) return false;
      }

      // 5. Preferred Field
      if (preferredField && student.preferred_field !== preferredField) {
        return false;
      }

      // 6. Experience
      if (experienceRange) {
        const exp = student.total_experience ?? 0;
        if (experienceRange === '0-6' && !(exp >= 0 && exp <= 6)) return false;
        if (experienceRange === '6-12' && !(exp >= 6 && exp <= 12)) return false;
        if (experienceRange === '12-24' && !(exp >= 12 && exp <= 24)) return false;
        if (experienceRange === '24+' && exp < 24) return false;
      }

      return true;
    });
  }, [
    allStudents,
    query,
    selectedSkills,
    openToFilter,
    dateFilter,
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
    setOpenToFilter('');
    setDateFilter({ from: '', to: '' });
    setFieldFilter(null);
    setExperienceRange(null);
    setPreferredField(null);
    setSkillSearchQuery('');
  };

  const uniquePreferredFields = useMemo(() => {
    if (!allStudents) return [];
    const fields = allStudents.map((s: any) => s.preferred_field).filter(Boolean);
    return Array.from(new Set(fields));
  }, [allStudents]);

  const filtersActive =
    query.trim() !== '' ||
    selectedSkills.length > 0 ||
    openToFilter !== '' ||
    dateFilter.from !== '' ||
    dateFilter.to !== '' ||
    fieldFilter !== null ||
    experienceRange !== null ||
    preferredField !== null;

  /* ---------------------- RENDER ---------------------- */
  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 pt-24 pb-10 md:px-6 md:pt-28">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
            <p className="text-muted-foreground text-sm">
              Browse students by skills, availability, and interests.
            </p>
          </div>

          <div className="text-muted-foreground mt-2 text-left text-xs md:mt-0 md:text-right">
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

        {/* 🟢 MOBILE ONLY: Filter Button (Sheet Trigger) */}
        <div className="mb-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex w-full items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter by Skills ({selectedSkills.length})
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>Filter Skills</SheetTitle>
              </SheetHeader>
              <div className="mt-4 h-full">
                {/* Reusing the Logic */}
                <SkillsFilterContent
                  skillsList={skillsList}
                  skillsLoading={skillsLoading}
                  selectedSkills={selectedSkills}
                  toggleSkill={toggleSkill}
                  skillSearchQuery={skillSearchQuery}
                  setSkillSearchQuery={setSkillSearchQuery}
                  clearSkills={() => setSelectedSkills([])}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* 🟢 DESKTOP SIDEBAR: Skills (Hidden on Mobile) */}
          <aside className="col-span-3 hidden md:block">
            <div className="sticky top-24">
              <div className="bg-card rounded-md border p-4">
                {/* Reusing the Logic */}
                <SkillsFilterContent
                  skillsList={skillsList}
                  skillsLoading={skillsLoading}
                  selectedSkills={selectedSkills}
                  toggleSkill={toggleSkill}
                  skillSearchQuery={skillSearchQuery}
                  setSkillSearchQuery={setSkillSearchQuery}
                  clearSkills={() => setSelectedSkills([])}
                />
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT (Spans full width on mobile) */}
          <main className="col-span-12 md:col-span-9">
            {/* Search */}
            <div className="mb-4 flex justify-center">
              <div className="w-full">
                <Input
                  placeholder="Search students by name, skill, or field..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Other Filters (Dropdowns) */}
            <div className="mb-6 flex flex-col flex-wrap items-start gap-3 sm:flex-row sm:items-center">
              <select
                value={openToFilter}
                onChange={(e) => setOpenToFilter(e.target.value)}
                className="bg-card w-full rounded-md border px-3 py-1.5 text-sm sm:w-auto"
              >
                <option value="">Opportunity (Any)</option>
                <option value="internship">Internship</option>
                <option value="job">Placement / Job</option>
              </select>

              {/* Date Filters */}
              <div className="flex w-full gap-2 sm:w-auto">
                <div className="bg-card flex flex-1 items-center gap-2 rounded-md border px-2 py-1">
                  <span className="text-muted-foreground text-xs">From:</span>
                  <input
                    type="date"
                    className="w-full bg-transparent text-sm focus:outline-none"
                    value={dateFilter.from}
                    onChange={(e) => setDateFilter((prev) => ({ ...prev, from: e.target.value }))}
                  />
                </div>
                <div className="bg-card flex flex-1 items-center gap-2 rounded-md border px-2 py-1">
                  <span className="text-muted-foreground text-xs">To:</span>
                  <input
                    type="date"
                    className="w-full bg-transparent text-sm focus:outline-none"
                    value={dateFilter.to}
                    onChange={(e) => setDateFilter((prev) => ({ ...prev, to: e.target.value }))}
                  />
                </div>
              </div>

              <select
                value={experienceRange ?? ''}
                onChange={(e) => setExperienceRange(e.target.value || null)}
                className="bg-card w-full rounded-md border px-3 py-1.5 text-sm sm:w-auto"
              >
                <option value="">Experience (any)</option>
                <option value="0-6">0-6 months</option>
                <option value="6-12">6-12 months</option>
                <option value="12-24">1-2 years</option>
                <option value="24+">2+ years</option>
              </select>

              <select
                value={preferredField ?? ''}
                onChange={(e) => setPreferredField(e.target.value || null)}
                className="bg-card w-full rounded-md border px-3 py-1.5 text-sm sm:w-auto"
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

            {/* Students List */}
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

                  const rawType = st.looking_for?.type;
                  const openToLabel = rawType
                    ? rawType.charAt(0).toUpperCase() + rawType.slice(1)
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
                      looking_for_start={st.looking_for?.from_date}
                      looking_for_end={st.looking_for?.to_date}
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
