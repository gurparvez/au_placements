import React, { useEffect, useState, useCallback, useRef, useId } from 'react';
import { Input } from '@/components/ui/input';
import { skillsApi } from '@/api/skills';
import type { Skill } from '@/api/skills';
import { Loader2, X, Check, Plus } from 'lucide-react';

interface SkillPickerProps {
  selected: string[];
  setSelected: (skills: string[]) => void;
  // NEW: Pass the full objects of existing skills so we can show their names immediately
  initialData?: Skill[]; 
  label?: string;
}

const SkillPicker: React.FC<SkillPickerProps> = ({ selected, setSelected, initialData = [], label }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [skillMap, setSkillMap] = useState<Record<string, Skill>>({});
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  /* ------------ 1. Initialize Map with Initial Data ------------ */
  useEffect(() => {
    if (initialData.length > 0) {
      setSkillMap((prev) => {
        const copy = { ...prev };
        initialData.forEach((s) => (copy[s._id] = s));
        return copy;
      });
    }
  }, [initialData]);

  /* ------------ Select / Unselect skill ------------ */
  const safeSelected = selected ?? [];

  const toggleSkill = (skillId: string) => {
    if (safeSelected.includes(skillId)) {
      setSelected(safeSelected.filter((id) => id !== skillId));
    } else {
      setSelected([...safeSelected, skillId]);
    }
    // Keep dropdown open for multi-select convenience, or close it:
    // setOpen(false); 
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
        setError(null);
        const results = await skillsApi.searchSkills(query.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Skill search error:', err);
        setSearchResults([]);
        setError('Failed to search skills. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    debouncedSearch();
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
      setError(null);
      const res: any = await skillsApi.addSkill(query.trim());
      // Handle response structure (adjust if your API returns { success: true, skill: ... })
      const newSkill: Skill = res.skill || res; 

      // Select it
      setSelected([...safeSelected, newSkill._id]);
      
      // Add to map so it displays correctly
      setSkillMap((prev) => ({
        ...prev,
        [newSkill._id]: newSkill,
      }));

      setQuery('');
      setSearchResults([]);
      setOpen(false);
    } catch (err) {
      console.error('Failed to add skill:', err);
      setError('Failed to add skill. Please try again.');
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
      <label htmlFor={inputId} className="eyebrow mb-1 block text-muted-foreground">
        {label ?? 'Skills'}
      </label>

      <Input
        id={inputId}
        aria-label={label ?? 'Search skills'}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${inputId}-listbox`}
        placeholder="Search skills (e.g. React)..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />

      {/* Dropdown */}
      {open && (searchResults.length > 0 || query.trim()) && (
        <div
          id={`${inputId}-listbox`}
          role="listbox"
          className="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border shadow-md"
        >
          {loading && (
            <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Searching...
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          {/* SHOW SEARCH RESULTS */}
          {!loading &&
            !error &&
            searchResults.map((skill) => {
              const isSelected = safeSelected.includes(skill._id);
              return (
                <button
                  key={skill._id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleSkill(skill._id)}
                  className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset flex w-full items-center justify-between px-3 py-2 text-sm"
                >
                  <span>{skill.displayName || skill.name}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" aria-hidden />
                  )}
                </button>
              );
            })}

          {/* EMPTY STATE */}
          {!loading && !error && query.trim() && searchResults.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No skills found.</div>
          )}

          {/* ADD NEW SKILL */}
          {!loading && !error && query.trim() && !searchResults.some(s => s.name.toLowerCase() === query.trim().toLowerCase()) && (
            <button
              type="button"
              className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset w-full px-3 py-2 text-left text-sm text-primary font-medium"
              onClick={handleAddSkill}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" aria-hidden />
                Add “{query.trim()}” as new skill
              </span>
            </button>
          )}
        </div>
      )}

      {/* SELECTED SKILLS CHIPS */}
      {safeSelected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {safeSelected.map((id) => {
            const displayName = skillMap[id]?.displayName || skillMap[id]?.name;
            return (
              <span
                key={id}
                className="bg-primary text-primary-foreground flex items-center gap-1 rounded-full px-3 py-1 text-xs"
              >
                {/* Display lookup from map OR muted loading placeholder */}
                {displayName ?? (
                  <span className="flex items-center gap-1 text-primary-foreground/60">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Loading
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleSkill(id)}
                  aria-label={`Remove ${displayName ?? 'skill'}`}
                  className="hover:bg-primary-foreground/20 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ml-1 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SkillPicker;
