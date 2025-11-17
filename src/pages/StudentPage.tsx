import React, { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import StudentCard from '/Users/mukeshchaudhary/Desktop/au_placements/src/components/StudentCard.tsx'; // adjust path if needed

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

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((st) => {
      // search across name, headline and skills
      const q = query.trim().toLowerCase();
      if (q) {
        const matchesQuery =
          st.name.toLowerCase().includes(q) ||
          st.headline.toLowerCase().includes(q) ||
          st.skills.join(' ').toLowerCase().includes(q) ||
          st.feild_preference.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // skills filter: student must have all selected skill chips
      if (selectedSkills.length > 0) {
        const hasAll = selectedSkills.every((sk) => st.skills.includes(sk));
        if (!hasAll) return false;
      }

      // openTo filter
      if (openToFilter && st.open_to !== openToFilter) return false;

      // field filter
      if (fieldFilter && st.feild_preference !== fieldFilter) return false;

      return true;
    });
  }, [query, selectedSkills, openToFilter, fieldFilter]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="grid grid-cols-12 gap-6">
        {/* Left: skills filter */}
        <aside className="col-span-12 md:col-span-3">
          <div className="sticky top-8">
            <h3 className="mb-4 text-sm font-medium">Skills</h3>
            <div className="flex max-h-[60vh] flex-col gap-3 overflow-auto pr-2">
              {MOCK_SKILLS.map((skill) => (
                <Button
                  key={skill}
                  variant={selectedSkills.includes(skill) ? undefined : 'ghost'}
                  onClick={() => toggleSkill(skill)}
                  className={`w-full justify-start rounded-full px-3 py-1 text-sm ${
                    selectedSkills.includes(skill) ? '' : ''
                  }`}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main: search + filters + list */}
        <main className="col-span-12 md:col-span-9">
          {/* Search centered */}
          <div className="mb-4 flex justify-center">
            <div className="w-full md:w-3/4">
              <Input
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters below search */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="sm"
              variant={openToFilter === null ? 'secondary' : 'ghost'}
              onClick={() => setOpenToFilter(null)}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={openToFilter === 'Internship' ? 'secondary' : 'ghost'}
              onClick={() => setOpenToFilter((v) => (v === 'Internship' ? null : 'Internship'))}
            >
              Internship/Placement
            </Button>
            <Button
              size="sm"
              variant={fieldFilter === null ? 'secondary' : 'ghost'}
              onClick={() => setFieldFilter(null)}
            >
              Preferred Field
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {}}>
              Experience
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {}}>
              Avg. GPA
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {}}>
              Course
            </Button>
          </div>

          <Separator className="mb-6" />

          {/* Students list (scrollable) */}
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
              <div className="text-muted-foreground text-center text-sm">No students found</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentsPage;
