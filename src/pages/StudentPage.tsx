import React, { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import StudentCard from '@/components/StudentCard';

// State/API
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchAllStudents } from '@/context/student/studentSlice';
import { skillsApi } from '@/api/skills';

// ----------------------------------------------------------------------
// 1. REUSABLE COMPONENT: Skills Filter List
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

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {skillsLoading && <div className="text-muted-foreground text-xs">Loading skills…</div>}

        {!skillsLoading &&
          skillsList
            .filter((skill) => skill.toLowerCase().includes(skillSearchQuery.trim().toLowerCase()))
            .map((skill) => (
              <Button
                key={skill}
                variant={selectedSkills.includes(skill) ? 'default' : 'ghost'}
                onClick={() => toggleSkill(skill)}
                className="h-auto min-h-8 w-full justify-start rounded-full px-3 py-1 text-sm"
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

  // University Filter State
  const [universityFilter, setUniversityFilter] = useState<string>('');

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

      // 🟢 FIX: Access university from the nested 'user' object
      const uni = student.user?.university || '';

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

      // 7. University Filter
      if (universityFilter && uni !== universityFilter) {
        return false;
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
    universityFilter,
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
    setUniversityFilter('');
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
    preferredField !== null ||
    universityFilter !== '';

  /* ---------------------- RENDER ---------------------- */
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col md:h-screen md:overflow-hidden">
      {/* Header Container */}
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pt-24 pb-4 md:h-full md:px-6 md:pt-20 md:pb-0">
        {/* Page Title */}
        <div className="mb-6 flex shrink-0 flex-col gap-2 md:flex-row md:items-end md:justify-between">
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

        {/* MOBILE ONLY: Filter Button (Sheet Trigger) */}
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 md:h-full md:min-h-0 md:grid-cols-12 md:pb-6">
          {/* DESKTOP SIDEBAR: Independent Scroll */}
          <aside className="hidden md:col-span-3 md:flex md:h-full md:min-h-0 md:flex-col">
            <div className="bg-card flex h-full flex-col rounded-md border p-4">
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
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex flex-col md:col-span-9 md:h-full md:min-h-0">
            {/* Search & Filters Bar */}
            <div className="mb-4 shrink-0 space-y-4">
              {/* Search */}
              <div className="w-full">
                <Input
                  placeholder="Search students by name, skill, or field..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {/* University Filter */}
                <select
                  value={universityFilter}
                  onChange={(e) => setUniversityFilter(e.target.value)}
                  className="bg-card rounded-md border px-3 py-1.5 text-sm"
                >
                  <option value="">University (Any)</option>
                  <option value="Akal University">Akal University</option>
                  <option value="Eternal University">Eternal University</option>
                </select>

                <select
                  value={openToFilter}
                  onChange={(e) => setOpenToFilter(e.target.value)}
                  className="bg-card rounded-md border px-3 py-1.5 text-sm"
                >
                  <option value="">Opportunity (Any)</option>
                  <option value="internship">Internship</option>
                  <option value="job">Placement / Job</option>
                </select>

                {/* Date Filters */}
                <div className="bg-card flex items-center gap-2 rounded-md border px-2 py-1">
                  <span className="text-muted-foreground text-xs">From:</span>
                  <input
                    type="date"
                    className="bg-transparent text-sm focus:outline-none"
                    value={dateFilter.from}
                    onChange={(e) => setDateFilter((prev) => ({ ...prev, from: e.target.value }))}
                  />
                </div>

                <div className="bg-card flex items-center gap-2 rounded-md border px-2 py-1">
                  <span className="text-muted-foreground text-xs">To:</span>
                  <input
                    type="date"
                    className="bg-transparent text-sm focus:outline-none"
                    value={dateFilter.to}
                    onChange={(e) => setDateFilter((prev) => ({ ...prev, to: e.target.value }))}
                  />
                </div>

                <select
                  value={experienceRange ?? ''}
                  onChange={(e) => setExperienceRange(e.target.value || null)}
                  className="bg-card rounded-md border px-3 py-1.5 text-sm"
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
                  className="bg-card max-w-[150px] truncate rounded-md border px-3 py-1.5 text-sm"
                >
                  <option value="">Field (any)</option>
                  {uniquePreferredFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>
              <Separator />
            </div>

            {/* Students List */}
            <div className="flex-1 pb-10 md:overflow-y-auto md:pr-2">
              {loading && <div className="text-muted-foreground text-center text-sm">Loading…</div>}

              {!loading && error && (
                <div className="text-center text-sm text-red-500">
                  Failed to load students: {error}
                </div>
              )}

              <div className="space-y-4">
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
                        // 🟢 FIX: Pass university from the nested user object
                        university={st.user?.university}
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
              </div>

              {!loading && !error && filteredStudents.length === 0 && (
                <div className="text-muted-foreground mt-10 text-center text-sm">
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
