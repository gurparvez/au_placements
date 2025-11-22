import React, { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import StudentCard from '@/components/StudentCard';

export type Student = {
  id: string;
  image_url: string;
  name: string;
  class: string;
  location: string;
  headline: string;
  feild_preference: string;
  open_to: string;
  exprience: string;
  skills: string[];
};

const MOCK_SKILLS = [
  'C++',
  'C',
  'Flutter',
  'Python',
  'JS',
  'Java',
  'R',
  'AWS',
  'TS',
  'React',
  'Node',
];

const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    image_url: '/avatar-1.png',
    name: 'Mukesh Chaudhary',
    class: 'BTech 7th sem',
    location: 'Himachal Pradesh',
    headline: 'Computer Science student, aspiring software developer',
    feild_preference: 'Software Developer',
    open_to: 'Internship',
    exprience: '1 yr.',
    skills: ['C++', 'React', 'Node'],
  },
  {
    id: 's2',
    image_url: '/avatar-2.png',
    name: 'Asha Sharma',
    class: 'BTech 6th sem',
    location: 'Punjab',
    headline: 'Interested in data and analytics',
    feild_preference: 'Data Scientist',
    open_to: 'Placement',
    exprience: '2 yr.',
    skills: ['Python', 'R', 'AWS'],
  },
  {
    id: 's3',
    image_url: '/avatar-3.png',
    name: 'Rohit Verma',
    class: 'BTech 7th sem',
    location: 'Himachal Pradesh',
    headline: 'Full-stack enthusiast',
    feild_preference: 'Software Developer',
    open_to: 'Internship',
    exprience: '6 mo.',
    skills: ['JS', 'React', 'TS'],
  },
];

const StudentsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [openToFilter, setOpenToFilter] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);

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
  };

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((st) => {
      const q = query.trim().toLowerCase();
      if (q) {
        const matchesQuery =
          st.name.toLowerCase().includes(q) ||
          st.headline.toLowerCase().includes(q) ||
          st.skills.join(' ').toLowerCase().includes(q) ||
          st.feild_preference.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (selectedSkills.length > 0) {
        const hasAll = selectedSkills.every((sk) => st.skills.includes(sk));
        if (!hasAll) return false;
      }

      if (openToFilter && st.open_to !== openToFilter) return false;
      if (fieldFilter && st.feild_preference !== fieldFilter) return false;

      return true;
    });
  }, [query, selectedSkills, openToFilter, fieldFilter]);

  const filtersActive =
    query.trim() !== '' ||
    selectedSkills.length > 0 ||
    openToFilter !== null ||
    fieldFilter !== null;

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
          {/* Left: skills filter */}
          <aside className="col-span-12 md:col-span-3">
            <div className="sticky top-24">
              <div className="bg-card rounded-md border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium">Skills</h3>
                  {selectedSkills.length > 0 && (
                    <button
                      type="button"
                      className="text-muted-foreground text-[11px] hover:underline"
                      onClick={() => setSelectedSkills([])}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex max-h-[60vh] flex-col gap-2 overflow-auto pr-1">
                  {MOCK_SKILLS.map((skill) => (
                    <Button
                      key={skill}
                      variant={selectedSkills.includes(skill) ? 'default' : 'ghost'}
                      onClick={() => toggleSkill(skill)}
                      className="w-full justify-start rounded-full px-3 py-1 text-sm"
                    >
                      {skill}
                    </Button>
                  ))}
                </div>

                {selectedSkills.length > 0 && (
                  <div className="text-muted-foreground mt-3 text-[11px]">
                    Selected: <span className="font-medium">{selectedSkills.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main: search + filters + list */}
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
              <Button
                size="sm"
                variant={openToFilter === null && fieldFilter === null ? 'secondary' : 'ghost'}
                onClick={() => {
                  setOpenToFilter(null);
                  setFieldFilter(null);
                }}
              >
                All
              </Button>

              <Button
                size="sm"
                variant={openToFilter === 'Internship' ? 'secondary' : 'ghost'}
                onClick={() => setOpenToFilter((v) => (v === 'Internship' ? null : 'Internship'))}
              >
                Internship
              </Button>

              <Button
                size="sm"
                variant={openToFilter === 'Placement' ? 'secondary' : 'ghost'}
                onClick={() => setOpenToFilter((v) => (v === 'Placement' ? null : 'Placement'))}
              >
                Placement
              </Button>

              <Button
                size="sm"
                variant={fieldFilter === 'Software Developer' ? 'secondary' : 'ghost'}
                onClick={() =>
                  setFieldFilter((v) => (v === 'Software Developer' ? null : 'Software Developer'))
                }
              >
                Software Developer
              </Button>

              <Button
                size="sm"
                variant={fieldFilter === 'Data Scientist' ? 'secondary' : 'ghost'}
                onClick={() =>
                  setFieldFilter((v) => (v === 'Data Scientist' ? null : 'Data Scientist'))
                }
              >
                Data Scientist
              </Button>
            </div>

            <Separator className="mb-6" />

            {/* Students list */}
            <div className="max-h-[60vh] space-y-6 overflow-auto pr-2">
              {filteredStudents.map((st) => (
                <StudentCard
                  key={st.id}
                  image_url={st.image_url}
                  name={st.name}
                  class={st.class}
                  location={st.location}
                  headline={st.headline}
                  feild_preference={st.feild_preference}
                  open_to={st.open_to}
                  exprience={st.exprience}
                  skills={st.skills}
                />
              ))}

              {filteredStudents.length === 0 && (
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
