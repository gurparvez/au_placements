// src/components/SkillPicker.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { skillsApi } from '@/api/skills';
import type { Skill } from '@/api/skills';
import { Loader2 } from 'lucide-react';

interface SkillPickerProps {
  selected: string[];
  setSelected: (skills: string[]) => void;
  label?: string;
}

const SkillPicker: React.FC<SkillPickerProps> = ({ selected, setSelected, label }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [skillMap, setSkillMap] = useState<Record<string, Skill>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  /* ------------ Select / Unselect skill ------------ */
  const safeSelected = selected ?? []; // ALWAYS an array

  const toggleSkill = (skillId: string) => {
    if (safeSelected.includes(skillId)) {
      setSelected(safeSelected.filter((id) => id !== skillId));
    } else {
      setSelected([...safeSelected, skillId]);
    }
    setOpen(false);
  };

  /* ------------ Debounced search ------------ */
  const debouncedSearch = useCallback(() => {
    const handler = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        const results = await skillsApi.searchSkills(query.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Skill search error:', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    return debouncedSearch();
  }, [query, debouncedSearch]);

  useEffect(() => {
    if (searchResults.length > 0) {
      setSkillMap((prev) => {
        const copy = { ...prev };
        searchResults.forEach((s) => (copy[s._id] = s));
        return copy;
      });
    }
  }, [searchResults]);

  /* ------------ Add new skill ------------ */
  const handleAddSkill = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await skillsApi.addSkill(query.trim());
      const newSkill: Skill = res;

      setSelected([...selected, newSkill._id]);
      setSkillMap((prev) => ({
        ...prev,
        [newSkill._id]: newSkill,
      }));

      setQuery('');
      setSearchResults([]);
      setOpen(false);
    } catch (err) {
      console.error('Failed to add skill:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ------------ Close dropdown on outside click ------------ */
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && <label className="mb-1 block text-sm font-medium">{label}</label>}

      <Input
        placeholder="Search or add skills…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {/* Dropdown */}
      {open && (searchResults.length > 0 || query.trim()) && (
        <div className="bg-card absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-sm">
          {loading && (
            <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching...
            </div>
          )}

          {/* SHOW SEARCH RESULTS */}
          {!loading &&
            searchResults.map((skill) => (
              <button
                key={skill._id}
                type="button"
                onClick={() => toggleSkill(skill._id)}
                className="hover:bg-muted flex w-full items-center justify-between px-3 py-2 text-sm"
              >
                <span>{skill.displayName || skill.name}</span>
                {(selected ?? []).includes(skill._id) && (
                  <span className="text-primary font-bold">✓</span>
                )}
              </button>
            ))}

          {/* ADD NEW SKILL */}
          {!loading && (
            <button
              type="button"
              className="hover:bg-muted w-full px-3 py-2 text-left text-sm text-blue-600"
              onClick={handleAddSkill}
            >
              Add “{query.trim()}” as new skill
            </button>
          )}
        </div>
      )}

      {/* SELECTED SKILLS */}
      {selected?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((id) => (
            <span
              key={id}
              className="bg-muted flex items-center gap-2 rounded-full px-3 py-1 text-xs"
            >
              {/** Display lookup from searchResults OR ID */}
              {skillMap[id]?.displayName || skillMap[id]?.name || 'Skill'}

              <button onClick={() => toggleSkill(id)} className="text-red-500">
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillPicker;
